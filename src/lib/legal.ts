/** Версия опубликованных условий и политики, подтверждаемая в заявке. */
export const LEGAL_DOCUMENT_VERSION = "2026-09-29.2";

export function hasRequiredLegalAcknowledgments(value: Record<string, unknown>): boolean {
  return value.termsAccepted === true &&
    value.privacyAcknowledged === true &&
    value.legalVersion === LEGAL_DOCUMENT_VERSION;
}
