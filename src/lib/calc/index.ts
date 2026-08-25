import { breakup } from './breakup.ts';
import { breakupDeep } from './breakup-deep.ts';
import { divorce } from './divorce.ts';
import { divorceDeep } from './divorce-deep.ts';
import { twilight } from './twilight.ts';
import { twilightDeep } from './twilight-deep.ts';
import type { CalcConfig, CalcType, Family } from './types.ts';

export const CONFIGS: Record<CalcType, CalcConfig> = {
  breakup,
  divorce,
  twilight,
  'breakup-deep': breakupDeep,
  'divorce-deep': divorceDeep,
  'twilight-deep': twilightDeep,
};

/** Display order everywhere: family by life stage, screener before deep dive. */
export const CALC_TYPES: CalcType[] = [
  'breakup',
  'breakup-deep',
  'divorce',
  'divorce-deep',
  'twilight',
  'twilight-deep',
];

export const FAMILIES: Family[] = ['breakup', 'divorce', 'twilight'];

/** Human label for each family, used on hubs and cards. */
export const FAMILY_LABEL: Record<Family, string> = {
  breakup: '연애',
  divorce: '부부',
  twilight: '황혼',
};

export function getConfig(type: CalcType): CalcConfig {
  return CONFIGS[type];
}

/** The screener and the deep dive for one life stage. */
export function pair(family: Family): { simple: CalcConfig; deep: CalcConfig } {
  return {
    simple: CONFIGS[family],
    deep: CONFIGS[`${family}-deep` as CalcType],
  };
}

export * from './types.ts';
export * from './engine.ts';
export * from './factors.ts';
export { breakup, breakupDeep, divorce, divorceDeep, twilight, twilightDeep };
