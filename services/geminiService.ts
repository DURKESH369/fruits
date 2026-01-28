
import { GoogleGenAI, Type } from "@google/genai";
import { Fruit } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const identifyFruit = async (base64Image: string): Promise<Partial<Fruit> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Identify this fruit. Return the details in JSON format including name, scientificName, description, origin, season, benefits (array), and nutrients (calories, sugar, fiber, vitaminC, potassium, protein, carbs per 100g).",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            description: { type: Type.STRING },
            origin: { type: Type.STRING },
            season: { type: Type.STRING },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutrients: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                sugar: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
                vitaminC: { type: Type.NUMBER },
                potassium: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
              },
            },
          },
          required: ["name", "description", "nutrients"],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error identifying fruit:", error);
    return null;
  }
};

export const getFruitAssistantResponse = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are an expert nutritionist and fruit specialist. Help the user with recipes, nutritional facts, and fruit selection tips. Be concise and friendly.',
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
