
import React from 'react';
import type { FareResult } from '../types';

interface FareCardProps {
  fare: FareResult;
}

const getIconForTransport = (transport: string) => {
    const lowerTransport = transport.toLowerCase();
    if (lowerTransport.includes('rickshaw')) {
        return '🛺'; 
    }
    if (lowerTransport.includes('cng')) {
        return '🛺'; 
    }
    if (lowerTransport.includes('ride') || lowerTransport.includes('car')) {
        return '🚗';
    }
    if (lowerTransport.includes('bus')) {
        return '🚌';
    }
    return '💰';
}


const FareCard: React.FC<FareCardProps> = ({ fare }) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="flex items-center mb-3">
        <span className="text-3xl mr-3">{getIconForTransport(fare.transport)}</span>
        <h3 className="text-lg font-semibold text-gray-800">{fare.transport}</h3>
      </div>
      <div className="flex-grow">
        <p className="text-2xl font-bold text-cyan-700 mb-2">{fare.fare}</p>
        <p className="text-sm text-gray-500">{fare.notes}</p>
      </div>
      {fare.bus_names && fare.bus_names.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700">বাসসমূহ:</p>
            <p className="text-sm text-gray-600">{fare.bus_names.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default FareCard;
