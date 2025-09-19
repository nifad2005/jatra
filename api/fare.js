const { GoogleGenAI, Type } = require("@google/genai");

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set on the server");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fareSchema = {
    type: Type.OBJECT,
    properties: {
        distance_km: {
            type: Type.NUMBER,
            description: "The estimated travel distance in kilometers."
        },
        fares: {
            type: Type.ARRAY,
            description: "A list of fare estimations for different transport modes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    transport: {
                        type: Type.STRING,
                        description: "Mode of transport (e.g., Local Bus, Rickshaw, CNG, Ride Sharing)."
                    },
                    fare: {
                        type: Type.STRING,
                        description: "Estimated fare in BDT. This should be the most common, fair market rate, avoiding surge pricing. Can be a range (e.g., '300-400 BDT') or a specific value."
                    },
                    notes: {
                        type: Type.STRING,
                        description: "Any relevant notes, e.g., 'Not practical for this distance' or 'Depends on traffic'."
                    },
                    bus_names: {
                        type: Type.ARRAY,
                        description: "An array of common bus service names for this route. Only populate for the 'Local Bus' transport type. Example: ['Turag', 'Raida']. Leave empty if not applicable.",
                        items: {
                            type: Type.STRING
                        }
                    }
                },
                required: ["transport", "fare", "notes"]
            }
        },
        travel_tips: {
            type: Type.ARRAY,
            description: "A list of 2-3 helpful travel tips for this specific journey.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["distance_km", "fares", "travel_tips"]
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { start, end } = req.body;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end locations are required' });
    }

    const prompt = `
        You are an expert travel assistant specializing in Dhaka, Bangladesh. You have deep knowledge of the city's road networks, typical traffic conditions, and current, realistic fare structures. Your primary goal is to provide the most accurate travel distance and fare estimations possible.

        Given a starting point and a destination within Dhaka, calculate the estimated travel distance, fares, and provide travel tips. Your response must be in JSON format.

        Key Instructions:
        1.  **Distance Calculation:** The distance in kilometers should be based on the most common and practical road routes, similar to what a GPS app like Google Maps would calculate for a car. Be as accurate as possible. For example, Mirpur 10 to Sadarghat is approximately 13-15 km, and Gazipur Chowrasta to Mirpur 10 is around 25-28 km. Use this as a reference for your calculation accuracy.
        2.  **Fare Estimation:** Provide fare estimates for: Local Bus, Rickshaw, CNG, and Ride Sharing (e.g., Uber/Pathao).
            -   **Crucially, all fare estimations should reflect the typical, average market rate.** Avoid quoting unusually high prices that might occur during peak demand surges or through aggressive negotiation. The goal is to inform the user of a fair and standard price.
            -   **Local Bus:** Provide a realistic fare based on typical non-AC bus rates. In the 'bus_names' array, list a few common bus companies that operate on this route (e.g., 'Turag', 'Raida', 'BRTC'). If no specific well-known buses operate on the exact route, you can leave the array empty.
            -   **Rickshaw/CNG:** Provide a typical fare range, acknowledging that fares are often negotiated. If the distance is too long for a rickshaw, state that in the notes.
            -   **Ride Sharing:** Provide a realistic price range that accounts for a typical trip, not peak surge pricing.
        3.  **Travel Tips:** In the 'travel_tips' array, provide 2-3 short, actionable pieces of advice for the user's journey. These could be about traffic patterns (e.g., "This route is heavily congested during evening rush hour"), negotiation tactics (e.g., "Always settle the fare with a CNG driver before you start"), or alternative options (e.g., "Consider using the metro rail if your destinations are near stations").
        4.  **Practicality:** In the 'notes' for each fare, mention if a transport mode is impractical for the route (e.g., 'Rickshaw is not practical for this long distance').
        5.  **Output Format:** The entire output must be a single JSON object conforming to the provided schema.

        The travel locations are:
        -   Start: "${start}"
        -   End: "${end}"
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: fareSchema,
        },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString);

    res.status(200).json(parsedData);

  } catch (error) {
    console.error("Error in serverless function:", error);
    res.status(500).json({ error: "সার্ভারে ভাড়া গণনা করতে সমস্যা হয়েছে।" });
  }
};
