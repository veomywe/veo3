
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT, GEMINI_MODEL_IMAGE } from '../constants';
import { PromptData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY untuk Gemini tidak diatur. Fitur Gemini tidak akan tersedia.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "DUMMY_KEY_FOR_INITIALIZATION" });

const SPOKEN_LINES_PLACEHOLDER = "___KALIMAT_YANG_DIUCAPKAN_TIDAK_DITERJEMAHKAN___";

export const generateDetailedIndonesianPrompt = async (promptData: PromptData): Promise<string> => {
  if (!API_KEY) throw new Error("Kunci API tidak dikonfigurasi. Tidak dapat membuat prompt.");
  try {
    let instruction = `Anda adalah seorang ahli pembuat prompt untuk model AI video canggih seperti Veo 3.
Tugas Anda adalah untuk merangkai dan mengembangkan konsep video yang diberikan menjadi sebuah prompt yang hidup, detail, dan sangat efektif dalam Bahasa Indonesia.
Fokus pada elemen naratif yang kuat, deskripsi visual yang kaya, isyarat artistik spesifik, gerakan kamera, pencahayaan, suasana hati, suara/musik, dan dialog (jika ada).
Pastikan outputnya adalah satu string prompt yang kohesif dan ditulis dengan baik dalam Bahasa Indonesia.

Detail input pengguna:
- Subjek: ${promptData.subject || 'Tidak ditentukan'}
- Aksi: ${promptData.action || 'Tidak ditentukan'}
- Ekspresi: ${promptData.expression || 'Tidak ditentukan'}
- Tempat/Setting: ${promptData.setting || 'Tidak ditentukan'}
- Waktu: ${promptData.timeOfDay || 'Tidak ditentukan'}
- Gerakan Kamera: ${promptData.cameraMovement || 'Tidak ditentukan'}
- Pencahayaan: ${promptData.lighting || 'Tidak ditentukan'}
- Gaya Video: ${promptData.videoStyle || 'Tidak ditentukan'}
- Suasana Video: ${promptData.videoMood || 'Tidak ditentukan'}
- Suara atau Musik: ${promptData.soundMusic || 'Tidak ditentukan'}
- Kalimat yang diucapkan: ${promptData.spokenLines ? `"${promptData.spokenLines}"` : 'Tidak ada'}
- Detail Tambahan: ${promptData.additionalDetails || 'Tidak ada'}

Prompt video yang dihasilkan (dalam Bahasa Indonesia):`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: instruction,
      config: {
        temperature: 0.75, // Slightly higher for more creativity
        topP: 0.95,
        topK: 50,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error membuat prompt dengan Gemini:", error);
    throw new Error("Gagal membuat prompt. Silakan coba lagi.");
  }
};

export const translateToEnglishWithExclusion = async (indonesianPrompt: string, originalSpokenLines: string): Promise<string> => {
  if (!API_KEY) throw new Error("Kunci API tidak dikonfigurasi. Tidak dapat menerjemahkan prompt.");
  
  let promptToTranslate = indonesianPrompt;
  if (originalSpokenLines && originalSpokenLines.trim() !== "") {
    // Replace the original spoken lines with a placeholder if they exist in the Indonesian prompt
    // This assumes the Indonesian generator includes them somewhat verbatim or clearly.
    // A more robust method might involve finding and replacing the specific spokenLines string.
    // For now, we assume it's present and we'll replace it.
    // This is tricky if the generated Indonesian prompt rephrases the spoken lines.
    // A safer bet is to assume Gemini was instructed to include it, and now we replace it before translation.
    const escapedSpokenLines = originalSpokenLines.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSpokenLines, 'gi');
    if (regex.test(promptToTranslate)) {
        promptToTranslate = promptToTranslate.replace(regex, SPOKEN_LINES_PLACEHOLDER);
    } else {
        // If exact phrase not found, we might need a more sophisticated way or simply acknowledge this limitation.
        // For now, if not found, we proceed without placeholder, hoping Gemini handles it.
        // Or, we can append the placeholder instruction if the original spoken lines were not found to be replaced.
        // This scenario needs careful handling. Let's proceed with replacement logic and if it fails,
        // the spoken lines might get translated, which is a known limitation of this simple replacement.
    }
  }

  try {
    const instruction = `Translate the following Indonesian video prompt to English.
IMPORTANT: If you see the text "${SPOKEN_LINES_PLACEHOLDER}", you MUST replace it with the exact phrase: "${originalSpokenLines || ""}". Do NOT translate "${SPOKEN_LINES_PLACEHOLDER}" or the replacement phrase.
Translate all other parts of the Indonesian prompt accurately and fluently into English.

Indonesian prompt:
"${promptToTranslate}"

English translation:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: instruction,
       config: {
        temperature: 0.3, // Lower temperature for more faithful translation
      }
    });
    
    let translatedText = response.text.trim();
    
    // Ensure the placeholder is replaced back if Gemini didn't do it or if it was not part of the prompt.
    // This is a fallback. The primary instruction is for Gemini to do the replacement.
    if (originalSpokenLines && originalSpokenLines.trim() !== "") {
        if (translatedText.includes(SPOKEN_LINES_PLACEHOLDER)) {
            translatedText = translatedText.replace(new RegExp(SPOKEN_LINES_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), originalSpokenLines);
        } else if (!translatedText.toLowerCase().includes(originalSpokenLines.toLowerCase()) && indonesianPrompt.includes(originalSpokenLines)) {
             // If placeholder wasn't used and original spoken lines are missing in translation, append them.
             // This is a fallback for cases where the placeholder strategy didn't fully work.
             // The goal is to ensure the spoken lines are in the English output in their original form.
             // This might not be perfectly placed but ensures inclusion.
             // A better long-term solution is more robust placeholder management or structured data to Gemini.
             // For now, we add a note if it seems missing.
             // translatedText += ` (Note: Original spoken lines: "${originalSpokenLines}")`;
        }
    }

    return translatedText;
  } catch (error) {
    console.error("Error menerjemahkan prompt dengan Gemini:", error);
    throw new Error("Gagal menerjemahkan prompt. Silakan coba lagi.");
  }
};


export const generateImageWithGemini = async (englishPrompt: string): Promise<string> => {
  if (!API_KEY) throw new Error("Kunci API tidak dikonfigurasi. Tidak dapat menghasilkan gambar.");
  try {
    const response = await ai.models.generateImages({
      model: GEMINI_MODEL_IMAGE,
      prompt: `Create a cinematic still frame representing this video concept: ${englishPrompt}. Focus on the primary subject, mood, and artistic style.`,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Tidak ada gambar yang dihasilkan oleh Gemini.");
  } catch (error) {
    console.error("Error menghasilkan gambar dengan Gemini:", error);
    if (error instanceof Error && error.message.includes("API Key not valid")) {
        throw new Error("Kunci API tidak valid. Silakan periksa konfigurasi Anda.");
    }
    throw new Error("Gagal menghasilkan gambar. Silakan coba lagi.");
  }
};
