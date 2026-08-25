import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CalcConfig, CalcResult, CalcType, Perspective } from './calc/types';

const URL = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/** Sharing is optional infrastructure: without keys the site still works. */
export const shareEnabled = Boolean(URL && ANON);

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!client) client = createClient(URL!, ANON!);
  return client;
}

export interface SharedResult {
  slug: string;
  calc_type: CalcType;
  perspective: Perspective;
  axis_scores: Record<string, number>;
  risk_index: number;
  grade: string;
  top_factors: string[];
  /** 1 = the retired model, 2 = the current one. Old rows default to 1. */
  model_version: number;
  /** Quadrant code, deep calculators only. */
  type_code: string | null;
  created_at?: string;
}

const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';

/** Ten characters of crypto-random, minus the glyphs people misread aloud. */
function makeSlug(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

/**
 * Persist the summary of a result and return its share path.
 *
 * Only the numbers are stored — never the individual answers, and never the
 * safety question under any circumstances. A person who receives the link
 * should see the shape of the result, not a transcript of what their partner
 * confessed to a form.
 */
export async function shareResult(
  config: CalcConfig,
  perspective: Perspective,
  result: CalcResult,
): Promise<string> {
  if (!shareEnabled) throw new Error('share-disabled');

  const slug = makeSlug();
  const row = {
    slug,
    calc_type: config.type,
    perspective,
    axis_scores: Object.fromEntries(result.dims.map((d) => [d.key, d.effective])),
    risk_index: result.index,
    grade: result.grade,
    top_factors: result.topFactors.map((f) => f.questionId),
    model_version: config.modelVersion,
    type_code: result.type?.code ?? null,
  };

  const { error } = await db().from('shared_results').insert(row);
  if (error) throw error;
  return `/r/${slug}`;
}

export async function fetchShared(slug: string): Promise<SharedResult | null> {
  if (!shareEnabled) return null;
  const { data, error } = await db()
    .from('shared_results')
    .select(
      'slug, calc_type, perspective, axis_scores, risk_index, grade, top_factors, model_version, type_code, created_at',
    )
    .eq('slug', slug)
    .maybeSingle();
  if (error) return null;
  return (data as SharedResult) ?? null;
}
