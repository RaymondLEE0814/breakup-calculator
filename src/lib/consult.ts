import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ConsultKind } from './partners';

const URL = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const consultEnabled = Boolean(URL && ANON);

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!client) client = createClient(URL!, ANON!);
  return client;
}

export interface ConsultRequest {
  client_token: string;
  kind: ConsultKind;
  source: string;
  nickname: string;
  phone: string;
  contact_hours: string;
  method?: string | null;
  region?: string | null;
  topics?: string[] | null;
  marriage_band?: string | null;
  minor_children?: string | null;
  message?: string | null;
  result_attached: boolean;
  risk_index?: number | null;
  grade?: string | null;
  type_code?: string | null;
  fault_band?: string | null;
  fault_top_dims?: string[] | null;
  agreed_privacy_at: string;
  agreed_thirdparty_at: string;
}

/**
 * Send a consultation request.
 *
 * No `.select()` is chained on purpose. The table grants anon insert and
 * nothing else — asking for the inserted row back would need a read policy,
 * and rows here hold phone numbers. Nobody reads this table from a browser.
 */
export async function submitConsult(row: ConsultRequest): Promise<void> {
  if (!consultEnabled) throw new Error('consult-disabled');
  const { error } = await db().from('consult_requests').insert(row);
  if (error) throw error;
}

/** Values the source column accepts, so a stray referrer cannot fail the insert. */
const SOURCES = new Set([
  'direct',
  'divorce',
  'divorce-deep',
  'twilight',
  'twilight-deep',
  'fault',
]);

export function normalizeSource(raw: string | null): string {
  return raw && SOURCES.has(raw) ? raw : 'direct';
}

/** 010-1234-5678 and the unhyphenated form. */
export const PHONE_PATTERN = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
