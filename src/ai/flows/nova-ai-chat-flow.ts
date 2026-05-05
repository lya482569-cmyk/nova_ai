'use server';
/**
 * @fileOverview This file implements the Nova AI Chat flow, allowing users to engage in intelligent,
 * natural language conversations with the AI in multiple languages, and now supports image analysis.
 *
 * - novaAIChat - A function that handles the AI chat process.
 * - NovaAIChatInput - The input type for the novaAIChat function.
 * - NovaAIChatOutput - The return type for the novaAIChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NovaAIChatInputSchema = z.object({
  prompt: z.string().describe('The user\'s query or message.'),
  language:
    z.enum(['en', 'ar', 'fr', 'es', 'de']).describe('The preferred response language (e.g., "en" for English, "ar" for Arabic, "fr" for French, "es" for Spanish, "de" for German).'),
  photoDataUri: z.string().optional().describe('Optional image data as a base64 Data URI.'),
});
export type NovaAIChatInput = z.infer<typeof NovaAIChatInputSchema>;

const NovaAIChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s intelligent and contextually aware response.'),
});
export type NovaAIChatOutput = z.infer<typeof NovaAIChatOutputSchema>;

export async function novaAIChat(input: NovaAIChatInput): Promise<NovaAIChatOutput> {
  return novaAIChatFlow(input);
}

const novaAIChatPrompt = ai.definePrompt({
  name: 'novaAIChatPrompt',
  input: {schema: NovaAIChatInputSchema},
  output: {schema: NovaAIChatOutputSchema},
  prompt: `You are Nova AI, a professional, intelligent, helpful, and friendly AI assistant.
Your goal is to understand the user's query and provide a comprehensive and accurate response.
If the user provides an image, analyze it carefully and answer any questions related to it.
Respond in the language specified by the user.

User's preferred language: {{{language}}}
User's message: {{{prompt}}}
{{#if photoDataUri}}Photo: {{media url=photoDataUri}}{{/if}}`,
});

const novaAIChatFlow = ai.defineFlow(
  {
    name: 'novaAIChatFlow',
    inputSchema: NovaAIChatInputSchema,
    outputSchema: NovaAIChatOutputSchema,
  },
  async input => {
    const {output} = await novaAIChatPrompt(input);
    return output!;
  }
);
