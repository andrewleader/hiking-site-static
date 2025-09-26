/**
 * Main entry point for the BetaCreator React library
 */

export { default as BetaCreator } from './components/BetaCreator';
export type { BetaCreatorProps, BetaCreatorRef } from './components/BetaCreator';

// Re-export types for consumers
export type {
  BetaCreatorOptions,
  BetaCreatorInstance,
  BetaCreatorReadyCallback,
  BetaCreatorConstructor,
  BetaCreatorData,
  BetaCreatorItemData,
  BetaCreatorLineData,
  BetaCreatorTextData,
  BetaCreatorStampData
} from './types/betacreator';

export {
  BetaCreatorProperties,
  BetaCreatorItemTypes
} from './types/betacreator';

// Version
export const version = '1.0.0';