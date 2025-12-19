import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IdeaSubmission, AnalysisResult } from "../types";

const SYSTEM_PROMPT = `
You are a senior Venture Capital Analyst and Startup Consultant. 
Your goal is to validate startup ideas rigorously. 
You must provide a realistic, critical, and data-backed analysis.
If the location involves Pakistan, specifically mention SECP, FBR, and local market nuances in the legal/market sections.
Output must be strictly valid JSON.
`;

const schema: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: "A 2-3 sentence high-level summary suitable for investors." },
    scores: {
      type: Type.OBJECT,
      properties: {
        market: { type: Type.INTEGER, description: "Score 0-100 based on market size/demand." },
        feasibility: { type: Type.INTEGER, description: "Score 0-100 based on technical/operational ease." },
        financial: { type: Type.INTEGER, description: "Score 0-100 based on profit potential." },
        uniqueness: { type: Type.INTEGER, description: "Score 0-100 based on competitive moat." },
        teamRequirement: { type: Type.INTEGER, description: "Score 0-100 regarding how complex the team needs to be (higher = harder)." },
      },
      required: ["market", "feasibility", "financial", "uniqueness", "teamRequirement"]
    },
    financials: {
      type: Type.ARRAY,
      description: "3-year projection. Numbers in USD (or converted equivalent).",
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.STRING },
          revenue: { type: Type.NUMBER },
          cost: { type: Type.NUMBER },
          profit: { type: Type.NUMBER }
        },
        required: ["year", "revenue", "cost", "profit"]
      }
    },
    marketAnalysis: { type: Type.STRING, description: "Deep dive into TAM/SAM/SOM and market trends." },
    competitors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 potential competitors." },
    legalSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      },
      description: "Key legal registration steps specific to the target country (e.g. SECP for Pakistan)."
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          mitigation: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
        },
        required: ["risk", "mitigation", "severity"]
      }
    },
    investmentVerdict: { type: Type.STRING, description: "Final verdict: Invest, Pivot, or Kill?" },
    recommendedStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tech stack recommendations." },
    hiringPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "First 3 key hires." }
  },
  required: ["executiveSummary", "scores", "financials", "marketAnalysis", "competitors", "legalSteps", "risks", "investmentVerdict", "recommendedStack", "hiringPlan"]
};

export const analyzeIdea = async (submission: IdeaSubmission): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userPrompt = `
    Analyze the following startup idea:
    Title: ${submission.title}
    Industry: ${submission.industry}
    Description: ${submission.description}
    Target Market: ${submission.targetMarket}
    Budget/Stage: ${submission.budget}
    Target Location: ${submission.location}
    
    Provide a professional investor-grade analysis. Be critical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, // Balance creativity with analytical structure
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
