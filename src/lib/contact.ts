/**
 * WhatsApp contact.
 *
 * The dispatch line (02671 8080) is a landline and is not necessarily reachable
 * on WhatsApp, so the button is opt-in: set NEXT_PUBLIC_WHATSAPP_NUMBER to a
 * number that really has WhatsApp (international format, e.g. "4917012345678")
 * and the button appears everywhere. Unset, nothing is rendered - better than a
 * CTA that leads to a dead chat.
 */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/[^\d]/g, '');

export function hasWhatsApp(): boolean {
  return WHATSAPP_NUMBER.length > 0;
}

export function getWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
