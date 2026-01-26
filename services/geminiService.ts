import { GoogleGenAI } from "@google/genai";
import { SmokeRecord, Member } from "../types";

export const getAIInsights = async (
  currentMember: Member,
  records: SmokeRecord[],
  allMembers: Member[]
): Promise<string> => {
  // Always initialize using the API_KEY from process.env directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare data for context
  const memberRecords = records
    .filter(r => r.memberId === currentMember.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  
  const context = `
    User: ${currentMember.name}
    Current week records: ${JSON.stringify(memberRecords)}
    Total members in group: ${allMembers.length}
    Task: Provide a short, motivating, and personalized health tip in Traditional Chinese (Taiwan). 
    Keep it under 100 words. Focus on the benefits of reducing smoking or congratulate if counts are low.
  `;

  try {
    // Correct way to call generateContent with model and contents
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
      config: {
        temperature: 0.7,
      },
    });

    // Extract text directly from response object (getter, not a function)
    return response.text || "無法獲取建議，請稍後再試。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "連線錯誤，建議深呼吸，今天也要加油！";
  }
};