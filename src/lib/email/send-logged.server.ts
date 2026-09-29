import { sendTemplateEmail } from '@/lib/email-templates/send-email'

async function writeLog(row: {
  template_name: string
  recipient_email: string
  status: 'sent' | 'suppressed' | 'failed'
  error_message?: string
}) {
  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { error } = await supabaseAdmin
      .from('email_send_log')
      .insert({ message_id: null, ...row })
    if (error) console.error('[email] Send log write failed', { code: error.code, message: error.message })
  } catch (e) {
    console.error('[email] Send log write failed', e instanceof Error ? e.message : 'unknown')
  }
}

/** Server-only: sends a registered template and records the outcome in the app's send log. */
export async function sendLoggedTemplateEmail(options: {
  templateName: string
  recipientEmail: string
  idempotencyKey?: string
  templateData?: Record<string, unknown>
}): Promise<{ success: boolean; reason?: string }> {
  const recipient = options.recipientEmail.toLowerCase()
  try {
    const result = await sendTemplateEmail(options.templateName, recipient, {
      templateData: options.templateData,
      idempotencyKey: options.idempotencyKey,
    })
    if (result.sent) {
      await writeLog({ template_name: options.templateName, recipient_email: recipient, status: 'sent' })
      return { success: true }
    }
    await writeLog({ template_name: options.templateName, recipient_email: recipient, status: 'suppressed' })
    return { success: false, reason: 'email_suppressed' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown send error'
    await writeLog({
      template_name: options.templateName,
      recipient_email: recipient,
      status: 'failed',
      error_message: message,
    })
    throw error
  }
}
