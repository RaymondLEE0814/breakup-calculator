import { CONFIGS } from './calc';
import type { CalcType, DimResult } from './calc/types';
import type { SharedResult } from './share';

/**
 * How to render a stored result, whichever model produced it.
 *
 * Links handed out under v1 are still in people's messages, and they have to
 * keep working. The rows themselves are just numbers plus a dimension key, so
 * all that is needed is the label set the keys belonged to at the time.
 */

interface LegacyModel {
  name: string;
  dims: Array<{ key: string; label: string; weight: number }>;
}

/** The v1 axis sets, frozen. Nothing here should ever change again. */
const V1: Record<string, LegacyModel> = {
  breakup: {
    name: '헤어질 확률 계산기',
    dims: [
      { key: 'behavior', label: '대화와 갈등', weight: 0.5 },
      { key: 'structure', label: '관계의 조건', weight: 0.2 },
      { key: 'economy', label: '현실과 경제', weight: 0.2 },
      { key: 'outlook', label: '마음과 전망', weight: 0.1 },
    ],
  },
  divorce: {
    name: '이혼 확률 계산기',
    dims: [
      { key: 'behavior', label: '대화와 갈등', weight: 0.45 },
      { key: 'economy', label: '경제와 살림', weight: 0.25 },
      { key: 'structure', label: '부부의 조건', weight: 0.15 },
      { key: 'trust', label: '신뢰와 전망', weight: 0.15 },
    ],
  },
  twilight: {
    name: '황혼 이혼 계산기',
    dims: [
      { key: 'behavior', label: '대화와 존중', weight: 0.35 },
      { key: 'later', label: '은퇴와 돌봄', weight: 0.25 },
      { key: 'economy', label: '노후 자금', weight: 0.2 },
      { key: 'structure', label: '함께한 시간', weight: 0.1 },
      { key: 'outlook', label: '마음과 전망', weight: 0.1 },
    ],
  },
};

export interface SharedView {
  name: string;
  /** Where "나도 해보기" should send the reader today. */
  path: string;
  dims: DimResult[];
  legacy: boolean;
}

/** Build everything the share page needs from a stored row, or null if the
 *  row references a model this build does not know. */
export function viewFor(row: SharedResult): SharedView | null {
  const scores = row.axis_scores ?? {};
  const read = (key: string) => Number(scores[key] ?? 0);

  if (row.model_version >= 2) {
    const config = CONFIGS[row.calc_type as CalcType];
    if (!config) return null;
    return {
      name: config.name,
      path: config.path,
      legacy: false,
      dims: config.dims.map((d) => ({
        key: d.key,
        label: d.label,
        weight: d.weight,
        levelOnly: d.levelOnly ?? false,
        note: d.note,
        value: read(d.key),
        effective: read(d.key),
      })),
    };
  }

  const model = V1[row.calc_type];
  if (!model) return null;
  // v1 rows point at the family's current screener, which is where a reader
  // who wants to try it themselves should land.
  const config = CONFIGS[row.calc_type as CalcType];
  return {
    name: model.name,
    path: config?.path ?? '/',
    legacy: true,
    dims: model.dims.map((d) => ({
      key: d.key,
      label: d.label,
      weight: d.weight,
      levelOnly: false,
      value: read(d.key),
      effective: read(d.key),
    })),
  };
}
