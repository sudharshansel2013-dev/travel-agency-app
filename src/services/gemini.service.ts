import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;
  constructor() { this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' }); }

  async generateItinerary(destination: string, days: string): Promise<string> {
    if (!process.env.API_KEY) return 'API Key missing.';
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a short itinerary for ${destination} for ${days} days. Keep it under 50 words.`,
      });
      return response.text || 'No itinerary generated.';
    } catch (e) { return 'Failed to generate itinerary.'; }
  }

  async generateItineraryItems(destination: string, days: number, currency: string): Promise<any[]> {
    if (!process.env.API_KEY) return [];
    try {
      const prompt = `Create a detailed quote line-item breakdown for a ${days}-day trip to ${destination}. Include Flights, Accommodation, Transfers, and Activities. Estimate prices in ${currency}.`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { description: { type: Type.STRING }, price: { type: Type.NUMBER } },
              required: ['description', 'price']
            }
          }
        }
      });
      let jsonText = response.text || '[]';
      return JSON.parse(jsonText);
    } catch (e) { return []; }
  }

  async generateEmail(type: 'invoice' | 'quotation', customerName: string, docNumber: string, amount: string): Promise<string> {
     if (!process.env.API_KEY) return 'API Key missing.';
     try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a email to ${customerName} sending ${type} #${docNumber} for amount ${amount}.`,
      });
      return response.text || 'Error generating email.';
    } catch (e) { return 'Error generating email.'; }
  }
}
