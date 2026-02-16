
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  parseFamilyStory: async (story: string) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following family story and identify all mentioned family members, their specific relationship types (biological, adoptive, etc.), marriages, and key memories. Return a JSON list of members. 
      Story: ${story}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            members: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  firstName: { type: Type.STRING },
                  lastName: { type: Type.STRING },
                  gender: { type: Type.STRING, description: "male, female, other, or unknown" },
                  bio: { type: Type.STRING },
                  birthDate: { type: Type.STRING, description: "YYYY-MM-DD if known" },
                  marriageDate: { type: Type.STRING, description: "YYYY-MM-DD if known" },
                  memories: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        type: { type: Type.STRING, description: "text" },
                        date: { type: Type.STRING }
                      },
                      required: ["content", "type"]
                    }
                  }
                },
                required: ["firstName", "lastName", "gender"]
              }
            }
          },
          required: ["members"]
        }
      }
    });

    try {
      // response.text is a property, not a method
      return JSON.parse(response.text || '{"members": []}');
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      return { members: [] };
    }
  }
};
