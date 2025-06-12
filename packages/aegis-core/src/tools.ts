// packages/aegis-core/src/tools.ts

import { TavilySearch } from "@langchain/tavily";
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { GenerateAdCopyInputSchema } from './schemas.js'; // Import the new schema

// Manually load the .env file from the project root.
// This makes the tool self-contained and removes ambiguity.
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!TAVILY_API_KEY) {
    throw new Error("CRITICAL: TAVILY_API_KEY not found in the .env file. Please ensure it is set correctly in the project root.");
}

// Export a function that creates and returns the tool.
export function createWebSearchTool() {
  const webSearchTool = new TavilySearch({
      maxResults: 3,
      // The API key is loaded from the environment variable.
  });
  return webSearchTool;
}
const creativeLlm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash-latest",
  temperature: 0.7, // Higher temperature for more creative outputs
});

/**
 * A specialized tool for Caelus to generate marketing copy.
 * It takes product details and generates ad copy tailored for a specific platform.
 */
export async function generateAdCopy(
  input: z.infer<typeof GenerateAdCopyInputSchema>
): Promise<string> {
  console.log(`--- TOOL: generateAdCopy ---`);
  console.log(`Generating copy for ${input.productName} on ${input.targetPlatform}`);

  try {
    const systemPrompt = new SystemMessage(
        `You are an expert copywriter. Your sole task is to generate compelling, short-form ad copy for the specified platform. The copy should be persuasive, concise, and include a clear call-to-action. Do not add any conversational fluff or introductory text. Provide only the ad copy itself.`
    );

    const userPrompt = new HumanMessage(
        `Product Name: ${input.productName}\nDescription: ${input.productDescription}\nTarget Platform: ${input.targetPlatform}`
    );

    const response = await creativeLlm.invoke([systemPrompt, userPrompt]);

    const adCopy = response.content.toString();
    console.log(`Generated Ad Copy: ${adCopy}`);
    
    return adCopy;

  } catch (error) {
    console.error("Error in generateAdCopy tool:", error);
    return "Error generating ad copy. Please check the logs.";
  }
}