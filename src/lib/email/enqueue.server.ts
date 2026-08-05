import * as React from 'react'
import { render } from '@react-email/render'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Lavidro'
const SENDER_DOMAIN = 'notify.lavidro.com'
const FROM_DOMAIN = 'lavidro.com'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function redactEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  return `${local[0]}***@${domain}`
}

async function getUnsubscribeToken(
  supabase: SupabaseClient<any, any>,
  email: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', email)
    .maybeSingle()

  if (existing?.token && !existing.used_at) return existing.token
  if (existing?.used_at) return null

  const token = generateToken()
  await supabase
    .from('email_unsubscribe_tokens')
    .upsert({ token, email }, { onConflict: 'email', ignoreDuplicates: true })

  const { data: stored } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', email)
    .maybeSingle()

  return stored?.token ?? null
}

/**
 * Server-only helper: renders a registered template and enqueues it for sending.
 * Used by public app routes (contact/lead/preorder) that have no user session.
 */
export async function enqueueTransactionalEmail(options: {
  templateName: string
  recipientEmail: string
  idempotencyKey?: string
  templateData?: Record<string, unknown>
}): Promise<{ success: boolean; reason?: string }> {
  const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.error('[email] Missing server configuration')
    return { success: false, reason: 'server_configuration' }
  }

  const template = TEMPLATES[options.templateName]
  if (!template) {
    console.error('[email] Unknown template', options.templateName)
    return { success: false, reason: 'unknown_template' }
  }

  const recipient = (template.to || options.recipientEmail || '').toLowerCase()
  if (!recipient) return { success: false, reason: 'missing_recipient' }

  const supabase = createClient(supabaseUrl, serviceKey)
  const messageId = crypto.randomUUID()

  const { data: suppressed, error: suppressionError } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', recipient)
    .maybeSingle()

  if (suppressionError) {
    console.error('[email] Suppression check failed', suppressionError.message)
    return { success: false, reason: 'suppression_check_failed' }
  }
  if (suppressed) {
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: options.templateName,
      recipient_email: recipient,
      status: 'suppressed',
    })
    return { success: false, reason: 'email_suppressed' }
  }

  const unsubscribeToken = await getUnsubscribeToken(supabase, recipient)
  if (!unsubscribeToken) return { success: false, reason: 'email_suppressed' }

  const templateData = options.templateData ?? {}
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: options.templateName,
    recipient_email: recipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: recipient,
      from: `${SITE_NAME} <hallo@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: options.templateName,
      idempotency_key: options.idempotencyKey ?? messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('[email] Enqueue failed', enqueueError.message)
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: options.templateName,
      recipient_email: recipient,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return { success: false, reason: 'enqueue_failed' }
  }

  console.log('[email] Queued', options.templateName, redactEmail(recipient))
  return { success: true }
}
