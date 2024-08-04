import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { GoogleGenerativeAI } from '@google/generative-ai';



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 4096,
    responseMimeType: "text/plain",
  },
});

export const pro_model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });