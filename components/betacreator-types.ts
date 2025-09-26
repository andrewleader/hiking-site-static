export interface BetaCreatorInstance {
  getData: (escape?: boolean) => string;
  loadData: (data: string) => void;
  getImage: (includeSource?: boolean, type?: string, width?: number) => string;
}

export interface BetaCreatorOptions {
  width?: number | string;
  height?: number | string;
  zoom?: 'contain' | 'cover' | 'fill' | number;
  scaleFactor?: number;
  onChange?: () => void;
  onError?: (error: string) => void;
}

export interface BetaCreatorReadyCallback {
  (this: BetaCreatorInstance): void;
}

export interface BetaCreatorItemData {
  it: 'line' | 'text' | 'anchor' | 'belay' | 'piton' | 'rappel';
  ic: string; // color
  is?: number; // scale
  x?: number;  // x position
  y?: number;  // y position
  [key: string]: any; // Additional properties depending on item type
}

export interface BetaCreatorData {
  items: BetaCreatorItemData[];
}

// Global window extension
declare global {
  interface Window {
    BetaCreator: (
      element: HTMLImageElement,
      callback: BetaCreatorReadyCallback,
      options?: BetaCreatorOptions
    ) => void;
  }
}