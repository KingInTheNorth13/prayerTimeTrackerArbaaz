import React, { useState, useEffect } from 'react';

const getBackgroundClass = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'bg-morning'; // Fajr to Dhuhr
  if (hour >= 12 && hour < 17) return 'bg-afternoon'; // Dhuhr to Asr
  if (hour >= 17 && hour < 20) return 'bg-evening'; // Asr to Isha
  return 'bg-night'; // Isha to Fajr
};

const DynamicBackground = ({ children }) => {
  const [backgroundClass, setBackgroundClass] = useState(getBackgroundClass());

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundClass(getBackgroundClass());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed inset-0 -z-10 transition-all duration-1000 ${backgroundClass}`}>
      {children}
    </div>
  );
};

export default DynamicBackground;
