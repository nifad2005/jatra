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
      const errorData = await response.json().catch(() => ({ error: `সার্ভার থেকে সাড়া পাওয়া যায়নি (${response.status})` }));
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const data: FareData = await response.json();
    return data;

  } catch (error) {
    console.error("Error fetching fare data:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("ভাড়া গণনা করতে সমস্যা হয়েছে। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
  }
};
