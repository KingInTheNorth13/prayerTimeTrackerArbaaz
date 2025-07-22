import React from 'react';
import MapPreview from './MapPreview';

// A simple icon component for prayers
const PrayerIcon = ({ prayerName }) => {
  const icons = {
    Fajr: '🌅',
    Dhuhr: '☀️',
    Asr: '🌤️',
    Maghrib: '🌇',
    Isha: '🌙',
    Jummah: '🕌',
  };
  return <span className="text-2xl mr-4">{icons[prayerName] || '⏱️'}</span>;
};

const PrayerTimeCard = ({ data }) => {
  const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayerTimes = [data.fajr, data.dhuhr, data.asr, data.maghrib, data.isha];

  return (
    <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-accent-purple/20 transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="flex items-center mb-4">
        {/* Mosque Icon */}
        <div className="p-3 bg-accent-gold/20 rounded-full mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2M3 11h.01M12 11h.01M21 11h.01M12 3v2.339A3.99 3.99 0 0115.66 8.339 3.99 3.99 0 0112 11.661 3.99 3.99 0 018.34 8.339 3.99 3.99 0 0112 3z" /></svg>
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading text-white">{data.mosque_name}</h3>
          <p className="text-sm text-text-secondary-dark">{data.mosque_address}</p>
        </div>
      </div>

      <ul className="space-y-3 mt-6 border-t border-white/10 pt-4">
        {prayerNames.map((name, index) => (
          <li key={name} className="flex justify-between items-center text-lg">
            <div className="flex items-center">
              <PrayerIcon prayerName={name} />
              <span className="font-semibold text-gray-300">{name}</span>
            </div>
            <span className="font-mono font-bold text-xl text-white bg-accent-purple/20 px-4 py-1 rounded-md">{prayerTimes[index]}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-4 border-t border-white/10">
        <MapPreview address={data.mosque_address} />
      </div>
    </div>
  );
};

export default PrayerTimeCard;
