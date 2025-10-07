// import { GoogleGenerativeAI } from "@google/generative-ai";

// let client: GoogleGenerativeAI | null = null;

// export function getGeminiClient() {
//   if (!client) {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       throw new Error("Missing GEMINI_API_KEY in environment");
//     }
//     client = new GoogleGenerativeAI(apiKey);
//   }
//   return client;
// }



import OpenAI from 'openai';
export const openAiClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if(!apiKey){
    throw new Error("Missing OpenRouter API Key  in environment");
  }
  return new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,

})};



// async function main() {
  
//   console.log(completion.choices[0].message);
// }

