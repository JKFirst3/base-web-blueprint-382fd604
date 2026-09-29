import type { ComponentType } from 'react'
import { template as leadConfirmation } from './lead-confirmation'
import { template as preorderConfirmation } from './preorder-confirmation'
import { template as preorderDoi } from './preorder-doi'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'lead-confirmation': leadConfirmation,
  'preorder-confirmation': preorderConfirmation,
  'preorder-doi': preorderDoi,
}
