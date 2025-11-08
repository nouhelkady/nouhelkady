import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { Angle, GeneratedImage, AspectRatio, DesignStyle } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractBase64FromResponse = (response: GenerateContentResponse): string => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }
    throw new Error("No image data found in API response.");
}

// =============================================
// MODULE 1: ElKady Products
// =============================================

export const generateScenePrompt = async (
  productImageBase64: string,
  productImageMimeType: string,
  referenceImage?: { base64: string; mimeType: string; }
): Promise<string> => {
    try {
        let parts: any[] = [];
        
        if (referenceImage) {
            const instruction = `CRITICAL: Analyze the provided image, which is a reference scene. Generate a concise and creative scene description prompt (under 25 words) that perfectly describes the environment, surfaces, and lighting shown. Do NOT describe any product that might be in the image, only the scene itself. Your entire output should only be the scene description. Example: "on a white marble countertop with a blurred kitchen background."`;
            parts = [
                { text: instruction },
                { inlineData: { data: referenceImage.base64, mimeType: referenceImage.mimeType } }
            ];
        } else {
            const instruction = `As a creative director, analyze the provided product image. Generate a concise and creative scene description prompt (under 25 words) to place the product in a photorealistic setting. The prompt should describe the environment, surfaces, and lighting. Do NOT describe the product itself. Only output the scene description. Example: "on a dark oak table next to a steaming cup of coffee, with soft morning light from a window."`;
            parts = [
                { text: instruction },
                { inlineData: { data: productImageBase64, mimeType: productImageMimeType } }
            ];
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
        });

        let text = response.text.trim();
        if (text.startsWith('"') && text.endsWith('"')) {
            text = text.substring(1, text.length - 1);
        }
        return text;
    } catch (error) {
        console.error(`Error generating scene prompt:`, error);
        throw new Error(`Failed to generate an AI prompt. Please try again.`);
    }
};

export const generateProductScene = async (
  productImageBase64: string,
  productImageMimeType: string,
  prompt: string,
  aspectRatio: AspectRatio,
  selectedStyle: DesignStyle,
  referenceImage?: { base64: string; mimeType: string; }
): Promise<GeneratedImage[]> => {
    try {
        const allStyles: Record<DesignStyle, { label: string; promptModifier: string; }> = {
            [DesignStyle.Realistic]: { label: 'Realistic', promptModifier: 'Create a photorealistic scene. The lighting should be natural and believable, casting soft shadows. The textures of the surfaces should be highly detailed. The final image must look like a real photograph taken with a high-end camera, suitable for a lifestyle magazine.' },
            [DesignStyle.Professional]: { label: 'Professional', promptModifier: 'Generate a clean and professional studio shot. Use controlled, multi-point lighting to eliminate harsh shadows and highlight the product\'s features. The background should be a seamless, neutral color (like light gray, white, or a subtle gradient) to ensure the product is the sole focus. The image should be sharp, well-composed, and perfect for e-commerce or advertising catalogs.' },
            [DesignStyle.Cinematic]: { label: 'Cinematic', promptModifier: 'Create a dramatic, cinematic shot. Use high-contrast lighting, like a single key light with deep shadows (chiaroscuro effect) or moody, atmospheric lighting with lens flares and a shallow depth of field. Apply a cinematic color grade (e.g., teal and orange, or cool blues). The composition should feel epic and tell a story.' },
            [DesignStyle.Creative]: { label: 'Creative', promptModifier: 'Create a highly creative and artistic concept. Use imaginative elements, abstract shapes, and a bold, complementary color palette. The composition should be unconventional and eye-catching, pushing boundaries to create a memorable image that feels more like a piece of modern art than a standard product photo.' },
            [DesignStyle.Commercial]: { label: 'Commercial', promptModifier: 'Generate a realistic, high-end advertising scene featuring a human model (or models) naturally interacting with the product. The composition must be cinematic and professional, with natural, appealing lighting. The overall mood should feel aspirational and authentic, like a still from a TV commercial or a major billboard campaign.' }
        };

        const style = allStyles[selectedStyle];
        if (!style) {
            throw new Error(`Invalid design style provided: ${selectedStyle}`);
        }

        const generationPromises = Array.from({ length: 4 }).map((_, i) => {
            const variationModifier = `This is creative variation #${i + 1} of 4.`;
            
            const aspectRatioName =
                aspectRatio === AspectRatio.Square ? 'square (1:1)' :
                aspectRatio === AspectRatio.Portrait ? 'portrait (9:16)' :
                'landscape (16:9)';
            const aspectRatioInstruction = `Generate the final image in a ${aspectRatioName} aspect ratio.`;

            const parts: any[] = [
                { inlineData: { data: productImageBase64, mimeType: productImageMimeType } },
            ];
            let fullPrompt: string;

            if (referenceImage) {
                parts.push({ inlineData: { data: referenceImage.base64, mimeType: referenceImage.mimeType } });
                fullPrompt = `The first image contains the product; the second is a style reference. Your task is to place the product from the first image into this scene: "${prompt}".

CRITICAL INSTRUCTIONS:
1.  **Replicate Style:** The final image's lighting, mood, color palette, and atmosphere must precisely match the second (style reference) image.
2.  **Preserve Product:** The product from the first image must remain completely unchanged. Do not alter its shape, colors, reflections, details, or logos.
3.  **Ignore Reference Content:** Do not include any objects or other products from the style reference image in the output. It is for style inspiration ONLY.
4.  **Apply Core Direction:** Incorporate this primary style: "${style.promptModifier}".
5.  **Set Aspect Ratio:** ${aspectRatioInstruction}.
6.  **Add Variation:** ${variationModifier}`;
            } else {
                fullPrompt = `Take the product from the image and place it in the following scene: "${prompt}". ${style.promptModifier} ${aspectRatioInstruction} ${variationModifier} CRITICAL: Do not alter the product's design, shape, color, or details in any way. Preserve the product's identity perfectly.`;
            }
            
            parts.push({ text: fullPrompt });
            
            return ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            }).then(response => ({
                src: `data:image/png;base64,${extractBase64FromResponse(response)}`,
                label: `${style.label} - Variation ${i + 1}`,
                filename: `product_scene_${style.label.toLowerCase().replace(' ', '_')}_var${i + 1}_${aspectRatio.replace(':', 'x')}.png`
            }));
        });
        
        const results = await Promise.all(generationPromises);
        return results;
    } catch (error) {
        console.error(`Error generating creative product scenes:`, error);
        throw new Error(`Failed to generate the product scenes. Please try again.`);
    }
};

// =============================================
// MODULE 2: Multi-Angle Generation
// =============================================

const getPromptForAngle = (angle: Angle): string => {
  const basePrompt = "CRITICAL: Do not change the original image background, lighting mood, shadows, reflections, surface marks, folds, and color grading. Preserve every product detail precisely — including shape, proportions, textures, materials, stitching, ports, labels, logos, printed text, and colors. Maintain the input aspect ratio and resolution. Only the camera viewpoint should change.";

  switch (angle) {
    case Angle.Top:
      return `Generate a top-down view (90° overhead) of the product in this image. ${basePrompt}`;
    case Angle.Bottom:
      return `Generate an underside view of the product in this image, emphasizing the bottom. ${basePrompt}`;
    case Angle.Low:
      return `Generate a low worm’s-eye angle view of the product in this image. ${basePrompt}`;
    default:
      throw new Error("Invalid angle provided");
  }
};

export const generateAngleImage = async (
  base64Image: string,
  mimeType: string,
  angle: Angle
): Promise<string> => {
  try {
    const prompt = getPromptForAngle(angle);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    return extractBase64FromResponse(response);

  } catch (error) {
    console.error(`Error generating ${angle} image:`, error);
    throw new Error(`Failed to generate the ${angle} image. Please try again.`);
  }
};


// =============================================
// MODULE 3: ElKady Upscale
// =============================================

export const upscaleImage = async (
  imageBase64: string,
  imageMimeType: string
): Promise<string> => {
    try {
        const prompt = "Critically, you must not change the content of the image. Upscale this image to 2K resolution (e.g., 2048x2048 pixels, maintaining the original aspect ratio). Enhance fine textures and details. Improve sharpness and clarity. Balance colors and lighting naturally. Do not add, remove, or alter any objects or elements in the image. The result should be a high-fidelity, photorealistic version of the original.";
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: imageBase64, mimeType: imageMimeType } },
              { text: prompt },
            ],
          },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });
    
        return extractBase64FromResponse(response);
    } catch (error) {
        console.error(`Error upscaling image:`, error);
        throw new Error(`Failed to upscale the image. Please try again.`);
    }
};

// =============================================
// MODULE 4: ElKady Brand Designer
// =============================================
export const generateBrandingAsset = async (
  logoBase64: string,
  logoMimeType: string,
  itemName: string
): Promise<string> => {
  try {
    const prompt = `Analyze the uploaded logo to extract its main and accent colors, visual tone, and personality. Then, design a realistic ${itemName} as part of a cohesive brand identity. Include creative layout, balanced typography, realistic materials, shadows, and lighting. Respect the logo’s original proportions and integrate it naturally into the design. The result should look like a real professionally designed product mockup, photographed under soft studio lighting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: logoBase64, mimeType: logoMimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    return extractBase64FromResponse(response);
  } catch (error) {
    console.error(`Error generating ${itemName}:`, error);
    throw new Error(`Failed to generate the ${itemName}. Please try again.`);
  }
};

// =============================================
// UTILITY
// =============================================

export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const mimeType = result.split(';')[0].split(':')[1];
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType });
        };
        reader.onerror = (error) => reject(error);
    });
};