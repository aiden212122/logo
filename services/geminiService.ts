import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserInput, AnalysisResult, BrandingStyle } from "../types";

// Helper to safely retrieve API Key from various environment configurations (Vite, Node, etc.)
const getApiKey = (): string => {
  // Check for Vite environment (Standard for Vercel React apps)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  // Check for Node/Webpack environment
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  // Fallback (might be empty, will be caught by error handling)
  return '';
};

// Initialize the client. 
const getAiClient = () => new GoogleGenAI({ apiKey: getApiKey() });

const STYLE_PROMPTS: Record<BrandingStyle, string> = {
  [BrandingStyle.NEW_CHINESE]: "Abstract 'New Chinese' Zen style. Use 1-3 flowing ink strokes to suggest the form. Minimalist, elegant, vast negative space. Sophisticated beige and jade tones. Do not be literal.",
  [BrandingStyle.TRADITIONAL]: "Traditional Chinese 'Xieyi' (freehand) painting style. Bold, abstract brush strokes. Focus on the spirit rather than the form. Minimal detail. Black ink texture.",
  [BrandingStyle.MODERN]: "Ultra-minimalist geometric abstraction. Reductionist design. Single line art or simple shapes. Clean, contemporary tech-wellness vibe.",
  [BrandingStyle.LUXURY]: "Abstract luxury symbol. Golden ratio composition. Minimalist serif monogram or simple abstract shape. Gold foil texture, symmetrical, premium hotel vibe.",
  [BrandingStyle.THAI]: "Abstract Thai elements. Simplified line art of lotus or elephant curves. Warm orange and purple tones, exotic but minimal.",
  [BrandingStyle.JAPANESE_ZEN]: "Enso circle aesthetic. Rough, organic, simple strokes. Wabi-sabi. Earth tones, extremely minimal composition."
};

/**
 * Step 1: Analyze the user input to extract visual symbols and colors.
 * Uses Gemini 2.5 Flash for fast, reasoning-based analysis.
 */
export const analyzeBrand = async (input: UserInput): Promise<AnalysisResult> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the following Spa/Foot Bath store details to prepare for Logo Design.
    
    Store Name: ${input.storeName}
    Slogan: ${input.slogan}
    Services: ${input.services}
    Style Preference: ${input.style}

    Your task:
    1. Recommend 3 distinct visual elements based on services (e.g., Lotus, Bamboo, Abstract Foot curve, Steam, Hands).
    2. Recommend a color scheme based on the name and style.
    3. Translate the store name and slogan into English (for internal prompt understanding).
    4. Provide a short reasoning for the design choice.

    IMPORTANT: Please provide the display fields (visualSymbols, colorPalette, designReasoning) in Simplified Chinese (简体中文).
    Provide the prompt fields (visualSymbolsEnglish, colorPaletteEnglish) in English.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      visualSymbols: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3个具体的视觉元素 (简体中文)，用于前端展示。"
      },
      visualSymbolsEnglish: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "The same 3 visual elements in English for image generation prompting."
      },
      colorPalette: {
        type: Type.STRING,
        description: "配色方案描述 (简体中文)，用于前端展示。"
      },
      colorPaletteEnglish: {
        type: Type.STRING,
        description: "Color palette description in English for image generation prompting."
      },
      englishTranslation: {
        type: Type.STRING,
        description: "English translation of the store name and slogan."
      },
      designReasoning: {
        type: Type.STRING,
        description: "设计理念简述 (简体中文)，解释为什么选择这些元素。"
      }
    },
    required: ["visualSymbols", "visualSymbolsEnglish", "colorPalette", "colorPaletteEnglish", "englishTranslation", "designReasoning"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7
    }
  });

  if (!response.text) throw new Error("Failed to analyze brand.");
  
  return JSON.parse(response.text) as AnalysisResult;
};

/**
 * Step 2: Construct the Prompt String.
 * Exposed so the UI can display and edit it.
 */
export const constructLogoPrompt = (input: UserInput, analysis: AnalysisResult): string => {
  const visualElementsStr = analysis.visualSymbolsEnglish.join(", ");
  const styleDesc = STYLE_PROMPTS[input.style];

  // Dynamic Prompt Construction
  return `
    Role: Master Logo Designer specializing in Zen, Minimalist, and Abstract Branding.

    [LAYOUT]
    Vertical composition: A distinct graphic icon on the TOP, followed by text on the BOTTOM.
    Center aligned. 
    Background: Pure White background (Hex #FFFFFF) for easy extraction.

    [ICON DESIGN]
    Subject: Abstract representation of ${visualElementsStr}.
    Style: ${styleDesc}
    Vibe: ${input.style} Wellness.
    
    CRITICAL DESIGN RULES:
    1. EXTREMELY SIMPLE: Use "Liao liao ji bi" (just a few strokes) technique.
    2. ABSTRACT: Do not draw a literal illustration. Suggest the shape using curves and negative space.
    3. CLEAN: No clutter, no small details, no complex shading.
    4. STROKES: Use confident, fluid lines (ink wash or vector curve).

    [TEXT RENDERING]
    Render the following text strictly below the icon. Do not misspell.
    1. Primary Text (Store Name): "${input.storeName}"
       - Font Style: Legible, Premium, matches the ${input.style} style. Ensure strokes are thick and legible.
       - Note: If Chinese characters, focus on visual aesthetics of the strokes (Calligraphy or Rounded Sans-serif).
    2. Secondary Text (Slogan): "${input.slogan}"
       - Font Style: Smaller, thinner, minimalist font underneath the main name.

    [COLOR & LIGHTING]
    Palette: ${analysis.colorPaletteEnglish}.
    Lighting: Soft studio lighting, vector crispness.

    [QUALITY]
    2K resolution, sharp edges, professional branding design. 
    Exclude: complex details, many lines, realistic shading, intricate patterns, clutter, photorealistic skin, medical cross.
  `;
};

/**
 * Step 3: Generate Image from Prompt.
 * Uses Gemini 3 Pro Image Preview.
 */
export const generateLogoFromPrompt = async (prompt: string, referenceImageBase64?: string, referenceImageMimeType?: string): Promise<string> => {
  const ai = getAiClient();
  const contents: any[] = [{ text: prompt }];

  // Add reference image if provided
  if (referenceImageBase64 && referenceImageMimeType) {
    contents.push({
      inlineData: {
        data: referenceImageBase64,
        mimeType: referenceImageMimeType
      }
    });
  }

  // Generate Image
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: contents
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "2K"
      }
    }
  });

  // Extract Image
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No image generated.");

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response.");
};