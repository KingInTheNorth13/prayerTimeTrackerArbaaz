import React from 'react';

const PrayerTimeCardSkeleton = () => {
  return (
    <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg animate-pulse">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full mr-4 bg-gray-700/50">
          <div className="h-6 w-6 rounded-full bg-gray-600/50"></div>
        </div>
        <div>
          <div className="h-5 w-40 bg-gray-600/50 rounded-md mb-2"></div>
          <div className="h-3 w-48 bg-gray-700/50 rounded-md"></div>
        </div>
      </div>

      <ul className="space-y-3 mt-6 border-t border-white/10 pt-4">
        {[...Array(5)].map((_, i) => (
          <li key={i} className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-700/50 rounded-md mr-4"></div>
              <div className="h-5 w-16 bg-gray-600/50 rounded-md"></div>
            </div>
            <div className="h-8 w-24 bg-gray-600/50 rounded-md"></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrayerTimeCardSkeleton;
