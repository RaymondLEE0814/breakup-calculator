import { breakup } from './breakup';
import { divorce } from './divorce';
import { twilight } from './twilight';
import type { CalcConfig, CalcType } from './types';

export const CONFIGS: Record<CalcType, CalcConfig> = { breakup, divorce, twilight };

export const CALC_TYPES: CalcType[] = ['breakup', 'divorce', 'twilight'];

export function getConfig(type: CalcType): CalcConfig {
  return CONFIGS[type];
}

export * from './types';
export * from './engine';
export * from './factors';
export { breakup, divorce, twilight };
