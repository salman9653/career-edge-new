import "server-only";
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment variables.");
}

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface GeneratedQuestion {
  question: string;
  type: "Mcq";
  difficulty: "Easy" | "Medium" | "Hard";
  categories: string[];
  status: string;
  mcqOptions: MCQOption[];
}

/**
 * Generates technical evaluation questions using Gemini 2.5 Flash.
 */
export async function generateQuestions(
  jobTitle: string,
  keySkills: string,
  difficulty: "Easy" | "Medium" | "Hard",
  count: number,
  avoidTexts?: string[]
): Promise<GeneratedQuestion[]> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in your environment.");
  }

  let avoidSection = "";
  if (avoidTexts && avoidTexts.length > 0) {
    // Only take the first 25 items to limit tokens, but this should be plenty.
    const limitedAvoidTexts = avoidTexts.slice(0, 25);
    avoidSection = `\n\nCRITICAL: Do NOT generate questions that are identical or highly similar to any of these existing questions:\n` +
      limitedAvoidTexts.map((txt, i) => `${i + 1}. "${txt}"`).join("\n");
  }

  const prompt = `You are an expert technical interviewer. Generate a list of ${count} high-quality, realistic evaluation questions for candidate interviews.
  
  Target Profile:
  - Job Title: ${jobTitle}
  - Key Skills: ${keySkills}
  - Target Difficulty: ${difficulty}
  - Question Type: Multiple Choice (MCQ) only
  
  Guidelines for questions:
  1. The questions must test real-world scenarios, architectural designs, code understanding, or key concepts relevant to the skills: "${keySkills}".
  2. Each MCQ question must have between 2 and 6 options. Exactly one option must be correct.
  3. Ensure the question statements are clear, professional, and do not contain placeholders.
  4. Formulate challenging distractors (incorrect options) that sound plausible.${avoidSection}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of generated technical interview questions",
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The question statement text. Should be scenario-based or conceptual."
              },
              type: {
                type: Type.STRING,
                enum: ["Mcq"],
                description: "The format of the question. Currently MCQ only."
              },
              difficulty: {
                type: Type.STRING,
                enum: ["Easy", "Medium", "Hard"],
                description: "The level of difficulty matching the target request."
              },
              categories: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Tags representing the topic or skill being evaluated (e.g. React.js, JavaScript, Hooks)."
              },
              status: {
                type: Type.STRING,
                enum: ["Active"],
                description: "Default status. Always Active."
              },
              mcqOptions: {
                type: Type.ARRAY,
                description: "List of multiple choice options. Must have between 2 and 6 items.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Sequential ID (e.g., '1', '2')" },
                    text: { type: Type.STRING, description: "Option text statement" },
                    isCorrect: { type: Type.BOOLEAN, description: "True if this is the correct option, false otherwise." }
                  },
                  required: ["id", "text", "isCorrect"]
                }
              }
            },
            required: ["question", "type", "difficulty", "categories", "status", "mcqOptions"]
          }
        },
        temperature: 0.85,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response from Gemini API");
    }

    const parsedQuestions = JSON.parse(responseText) as GeneratedQuestion[];
    return parsedQuestions;
  } catch (err) {
    console.error("Gemini API generateQuestions error:", err);
    throw err;
  }
}
