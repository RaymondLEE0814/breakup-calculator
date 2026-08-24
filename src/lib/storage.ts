import type { AnswerMap, CalcType, Perspective } from './calc/types';

export interface Session {
  perspective: Perspective;
  answers: AnswerMap;
}

const key = (type: CalcType) => `calc:${type}`;

/**
 * Answers live in sessionStorage and nowhere else until the visitor presses
 * share. Nothing here ever touches the network — that promise is made on the
 * home page and in the privacy policy, so keep it true.
 */
export function loadSession(type: CalcType): Session | null {
  try {
    const raw = sessionStorage.getItem(key(type));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed || typeof parsed !== 'object' || !parsed.answers) return null;
    return { perspective: parsed.perspective ?? 'na', answers: parsed.answers };
  } catch {
    // Private browsing modes can throw on access. A missing session just means
    // the visitor starts over.
    return null;
  }
}

export function saveSession(type: CalcType, session: Session): void {
  try {
    sessionStorage.setItem(key(type), JSON.stringify(session));
  } catch {
    /* Not being able to remember is survivable; crashing is not. */
  }
}

export function clearSession(type: CalcType): void {
  try {
    sessionStorage.removeItem(key(type));
  } catch {
    /* ignore */
  }
}
