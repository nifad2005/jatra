import type { FareData } from '../types';

export const calculateFare = async (start: string, end: string): Promise<FareData> => {
  try {
    const response = await fetch('/api/fare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start, end }),
    });

    if (!response.ok) {
      let errorMessage = `সার্ভার থেকে সাড়া পাওয়া যায়নি (${response.status})।`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        console.error("Could not parse error response JSON:", e);
      }
      throw new Error(errorMessage);
    }

    try {
      const data: FareData = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to parse successful response JSON:", error);
      throw new Error("সার্ভার থেকে একটি অপ্রত্যাশিত উত্তর এসেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
    }

  } catch (error) {
    console.error("Error fetching fare data:", error);
    if (error instanceof Error) {
        if (error.name === 'TypeError') {
            throw new Error("নেটওয়ার্ক সমস্যা। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
        }
        throw error; // Re-throw the already specific error message
    }
    throw new Error("একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
  }
};