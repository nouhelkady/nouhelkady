export interface GeneratedImage {
  src: string;
  label: string;
  filename: string;
}

// Module 1: ElKady Products
export enum SceneType {
  Studio = "Studio",
  Outdoor = "Outdoor",
  Lifestyle = "Lifestyle",
  Minimal = "Minimal",
  Luxury = "Luxury",
  Abstract = "Abstract",
}

export enum LightingStyle {
  Soft = "Soft",
  Natural = "Natural",
  Dramatic = "Dramatic",
  GoldenHour = "Golden Hour",
  Neutral = "Neutral",
}

export enum CameraAngle {
  Front = "Front",
  Side = "Side",
  FortyFive = "45°",
  Overhead = "Overhead",
}

export enum AspectRatio {
  Square = "1:1",
  Portrait = "9:16",
  Landscape = "16:9",
}

export enum DesignStyle {
  Realistic = "Realistic",
  Professional = "Professional",
  Cinematic = "Cinematic",
  Creative = "Creative",
  Commercial = "Commercial",
}

export const productProcessingSteps = [
  "Analyzing product...",
  "Preparing generation pipeline...",
  "Compositing final images...",
  "Finalizing results..."
];


// Module 2: Multi-Angle Generation
export enum Angle {
  Top = 'Top View',
  Bottom = 'Bottom View',
  Low = 'Low Angle',
}

export const multiAngleProcessingSteps = [
  "Analyzing product details…",
  "Preserving background…",
  "Generating Top View…",
  "Generating Bottom View…",
  "Generating Low Angle…",
  "Finalizing images..."
];

// Module 3: ElKady Upscale
export const upscaleProcessingSteps = [
  "Enhancing image details…",
  "Balancing color tones…",
  "Upscaling to 2K resolution…",
  "Finalizing image..."
];