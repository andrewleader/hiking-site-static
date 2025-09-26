/**
 * TypeScript definitions for BetaCreator library
 */

// BetaCreator API types
export interface BetaCreatorOptions {
  width?: number | string;
  height?: number | string;
  zoom?: 'contain' | 'cover' | 'fill' | number;
  parent?: HTMLElement;
  onChange?: () => void;
  scaleFactor?: number;
  onError?: (error: string) => void;
}

export interface BetaCreatorInstance {
  loadData: (data: string) => void;
  getData: (escape?: boolean) => string;
  getImage: (
    includeSource?: boolean,
    type?: string,
    width?: number,
    srcImage?: HTMLImageElement
  ) => string;
}

export type BetaCreatorReadyCallback = (this: BetaCreatorInstance) => void;

export interface BetaCreatorConstructor {
  (
    sourceImg: HTMLImageElement,
    onReady?: BetaCreatorReadyCallback | null,
    options?: BetaCreatorOptions
  ): BetaCreatorInstance;
}

// Internal BetaCreator namespace types (for the goog-shim compatibility)
declare global {
  interface Window {
    BetaCreator: BetaCreatorConstructor;
    bc?: any;
    goog?: any;
  }
}

// Properties enum
export enum BetaCreatorProperties {
  ITEM_TYPE = 'it',
  ITEM_COLOR = 'ic',
  ITEM_SCALE = 'is',
  ITEM_ALPHA = 'ia',
  ITEM_LINEWIDTH = 'lw',
  ITEM_X = 'x',
  ITEM_Y = 'y',
  ITEM_W = 'w',
  ITEM_H = 'h',
  TEXT_ALIGN = 'ta',
  LINE_CONTROLPOINTS = 'cp',
  LINE_CURVED = 'lc',
  LINE_OFFLENGTH = 'fl',
  LINE_ONLENGTH = 'nl',
  TEXT = 't',
  TEXT_BG = 'tb'
}

// Item types
export enum BetaCreatorItemTypes {
  ANCHOR = 'anchor',
  PITON = 'piton',
  RAPPEL = 'rappel',
  BELAY = 'belay',
  LINE = 'line',
  TEXT = 'text'
}

// Data structure for saved routes
export interface BetaCreatorData {
  items: BetaCreatorItemData[];
}

export interface BetaCreatorItemData {
  [key: string]: any;
  it?: BetaCreatorItemTypes; // item type
  ic?: string; // item color
  is?: number; // item scale
  ia?: number; // item alpha
  x?: number;  // x position
  y?: number;  // y position
}

export interface BetaCreatorLineData extends BetaCreatorItemData {
  cp?: number[][]; // control points
  lc?: boolean;    // line curved
  lw?: number;     // line width
  fl?: number;     // off length
  nl?: number;     // on length
}

export interface BetaCreatorTextData extends BetaCreatorItemData {
  t?: string;     // text content
  tb?: string;    // text background
  ta?: string;    // text align
}

export interface BetaCreatorStampData extends BetaCreatorItemData {
  w?: number;     // width
  h?: number;     // height
}