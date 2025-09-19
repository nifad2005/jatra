import React, { useState, useCallback } from 'react';
import { calculateFare } from './services/geminiService';
import type { FareData, FareResult } from './types';
import LocationIcon from './components/icons/LocationIcon';
import ArrowIcon from './components/icons/ArrowIcon';
import Loader from './components/Loader';
import FareCard from './components/FareCard';
import CheckIcon from './components/icons/CheckIcon';

const App: React.FC = () => {
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [fareData, setFareData] = useState<FareData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(async () => {
    if (!startLocation || !endLocation) {
      setError('অনুগ্রহ করে শুরু এবং গন্তব্য উভয় স্থান লিখুন।');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFareData(null);

    try {
      const result = await calculateFare(startLocation, endLocation);
      setFareData(result);
    } catch (err) {
      console.error(err);
      setError('ভাড়া গণনা করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  }, [startLocation, endLocation]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-cyan-100">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">যাত্রা</h1>
            <p className="text-gray-500 mt-2">আপনার শুরুর এবং গন্তব্য লিখুন এবং আনুমানিক ভাড়া জানুন।</p>
          </header>

          <main>
            <div className="space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4 mb-6">
              <div className="relative flex-1">
                <label htmlFor="start" className="absolute -top-2.5 left-2 inline-block bg-white px-1 text-sm font-medium text-gray-900">শুরু</label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <LocationIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="start"
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="যেমন: উত্তরা"
                  className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="hidden md:block text-gray-400">
                <ArrowIcon className="w-6 h-6"/>
              </div>

              <div className="relative flex-1">
                 <label htmlFor="end" className="absolute -top-2.5 left-2 inline-block bg-white px-1 text-sm font-medium text-gray-900">গন্তব্য</label>
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <LocationIcon className="h-5 w-5 text-gray-400" />
                 </div>
                <input
                  id="end"
                  type="text"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="যেমন: মতিঝিল"
                  className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader />
                  <span className="ml-2">গণনা করা হচ্ছে...</span>
                </>
              ) : (
                'ভাড়া দেখুন'
              )}
            </button>

            {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}

            {fareData && (
              <div className="mt-8 animate-fade-in">
                 <h2 className="text-xl font-semibold text-center text-gray-700 mb-2">আনুমানিক দূরত্ব: {fareData.distance_km} কি.মি.</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {fareData.fares.map((fare: FareResult, index: number) => (
                      <FareCard key={index} fare={fare} />
                    ))}
                 </div>

                 {fareData.travel_tips && fareData.travel_tips.length > 0 && (
                    <div className="mt-8 bg-teal-50/70 p-5 rounded-lg border border-teal-200">
                        <h3 className="text-lg font-semibold text-teal-800 mb-3">ভ্রমণ টিপস</h3>
                        <ul className="space-y-2">
                            {fareData.travel_tips.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckIcon className="h-5 w-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0"/>
                                    <span className="text-gray-700">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
              </div>
            )}
          </main>
        </div>
        <footer className="text-center mt-6 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Jatra. All fares are estimates.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;