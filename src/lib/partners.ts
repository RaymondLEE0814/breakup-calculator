/**
 * Consultation partners.
 *
 * Korean privacy law requires the third-party consent notice to name the
 * organisation that will receive the information. A form that asks for a phone
 * number while the recipient is "미정" is not a form we are allowed to run, so
 * the pages here check `partnerFor()` and render an information page without
 * the form until a name is filled in. Setting the name is the only step needed
 * to open a form.
 */

export interface Partner {
  /** Legal name of the organisation, exactly as it should appear in consent. */
  name: string;
  /** One line describing what they do, shown above the form. */
  blurb: string;
  /** How long they hold the data, for the consent notice. */
  retention: string;
}

export type ConsultKind = 'counseling' | 'legal';

export const PARTNERS: Record<ConsultKind, Partner | null> = {
  // 예: { name: '○○부부상담센터', blurb: '…', retention: '상담 종료 후 …' }
  counseling: null,
  legal: null,
};

/** Where deletion requests and failed submissions go. */
export const CONTACT_EMAIL = 'repeachsukjin@gmail.com';

/** Days a request is kept before it is destroyed. Quoted in the consent copy. */
export const RETENTION_DAYS = 90;

export function partnerFor(kind: ConsultKind): Partner | null {
  return PARTNERS[kind];
}
