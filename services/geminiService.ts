
import { GoogleGenAI, Type } from "@google/genai";
import { SmokeHistory, AIInsight } from "../types";
// Corrected import from USERS to INITIAL_USERS
import { INITIAL_USERS } from "../constants";

export async function getAIHealthInsights(history: SmokeHistory): Promise<AIInsight | null> {
  // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the current API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const recentDates = Object.keys(history).sort().slice(-7);
  const recentData = recentDates.map(date => ({
    date,
    records: history[date]
  }));

  const prompt = `
    這是一個五人戒菸紀錄小組的數據：
    成員：${INITIAL_USERS.map(u => u.name).join(', ')}
    最近七天數據：${JSON.stringify(recentData)}

    請根據這些數據，分析每個人的抽菸趨勢，提供一份具體的健康建議和一句激勵人心的話。
    請使用繁體中文。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "總結最近這段時間大家的表現" },
            suggestion: { type: Type.STRING, description: "針對這幾位成員的健康建議" },
            motivationalQuote: { type: Type.STRING, description: "一句激勵大家少抽點菸的話" }
          },
          required: ["summary", "suggestion", "motivationalQuote"]
        }
      }
    });

    // Directly access the .text property (not a method) from GenerateContentResponse
    const text = response.text;
    if (text) {
      return JSON.parse(text.trim()) as AIInsight;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}
