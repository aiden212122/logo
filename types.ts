export enum BrandingStyle {
  NEW_CHINESE = 'New Chinese',
  TRADITIONAL = 'Traditional',
  MODERN = 'Modern',
  LUXURY = 'Luxury',
  THAI = 'Thai',
  JAPANESE_ZEN = 'Japanese Zen'
}

export interface UserInput {
  storeName: string;
  slogan: string;
  services: string;
  style: BrandingStyle;
  referenceImageBase64?: string;
  referenceImageMimeType?: string;
}

export interface AnalysisResult {
  visualSymbols: string[]; // Chinese for display
  visualSymbolsEnglish: string[]; // English for prompt
  colorPalette: string; // Chinese for display
  colorPaletteEnglish: string; // English for prompt
  englishTranslation: string; // For text rendering prompts
  designReasoning: string; // Chinese for display
}

export interface GeneratedLogo {
  imageUrl: string;
  promptUsed: string;
}