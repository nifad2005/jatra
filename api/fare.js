import { GoogleGenAI, Type } from "@google/genai";

// Vercel serverless function handler
export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get API Key from environment variables
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY not found in environment variables.");
    return response.status(500).json({ error: 'API key is not configured on the server.' });
  }

  // Parse request body for start and end locations
  const { start, end } = request.body;
  if (!start || !end) {
    return response.status(400).json({ error: 'Please provide both a start and end location.' });
  }

  try {
    // Initialize the Generative AI client
    const ai = new GoogleGenAI({ apiKey });

    // Define the expected JSON schema for the AI's response
    const fareSchema = {
      type: Type.OBJECT,
      properties: {
        distance_km: {
          type: Type.NUMBER,
          description: "Estimated travel distance in kilometers.",
        },
        fares: {
          type: Type.ARRAY,
          description: "A list of fare estimations for different modes of transport.",
          items: {
            type: Type.OBJECT,
            properties: {
              transport: {
                type: Type.STRING,
                description: "The mode of transport (e.g., 'Local Bus', 'Rickshaw', 'CNG', 'Ride Sharing').",
              },
              fare: {
                type: Type.STRING,
                description: "The estimated fare range in BDT, formatted as a string (e.g., '২৫-৩০ টাকা').",
              },
              notes: {
                type: Type.STRING,
                description: "Any relevant notes about the fare, such as variability or conditions.",
              },
              bus_names: {
                type: Type.ARRAY,
                description: "An optional list of common bus service names for the specified route.",
                items: { type: Type.STRING },
              },
            },
            required: ["transport", "fare", "notes"],
          },
        },
        travel_tips: {
          type: Type.ARRAY,
          description: "A few useful travel tips for the journey, in Bengali.",
          items: { type: Type.STRING },
        },
      },
      required: ["distance_km", "fares", "travel_tips"],
    };

    // Construct the prompt for the AI model
    const prompt = `Dhaka city commute fare estimation:
    From: "${start}"
    To: "${end}"
    
    Tasks:
    1. Calculate the estimated distance in kilometers.
    2. Provide realistic, market-rate fare ranges in BDT (using Bengali script for numbers and currency, e.g., '৫০-৬০ টাকা') for these transport modes: 'Local Bus', 'Rickshaw', 'CNG', and 'Ride Sharing (Car)'.
    3. For 'Local Bus', list a few common bus names that operate on this route, if available.
    4. Provide 3-4 concise and practical travel tips in Bengali for this specific journey.
    
    The entire response must be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text or formatting outside of the JSON object.`;

    // Call the Gemini API to generate content
    const genAIResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: fareSchema,
      },
    });

    // Parse the JSON text from the AI's response
    const fareData = JSON.parse(genAIResponse.text);
    
    // Send the successful response back to the client
    return response.status(200).json(fareData);

  } catch (error) {
    console.error('Error in Gemini API call:', error);
    return response.status(500).json({ error: 'An error occurred while communicating with the AI service to calculate the fare.' });
  }
}
