export interface Stamp {
  id: string;
  name: string;
  /** SVG string or data URL of the stamp artwork */
  src: string;
  /** Category for library organisation */
  category: string;
  /** Whether it came from the AI generator */
  aiGenerated: boolean;
  createdAt: number;
}

export interface PlacedStamp {
  id: string;
  stampId: string;
  /** Position on the card canvas (0-1 normalised, relative to card size) */
  x: number;
  y: number;
  /** Rotation in degrees */
  rotation: number;
  /** Scale factor (1 = natural size) */
  scale: number;
  /** Hex tint colour applied to the stamp */
  tint: string;
  /** Opacity 0-1 */
  opacity: number;
  /** Whether to flip horizontally */
  flipX: boolean;
}

export interface CardDesign {
  id: string;
  name: string;
  /** Background colour of the card */
  background: string;
  placedStamps: PlacedStamp[];
  createdAt: number;
  updatedAt: number;
}

export type ToolMode = 'select' | 'stamp' | 'erase';
