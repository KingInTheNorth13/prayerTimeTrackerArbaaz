import React, { useState, useEffect } from 'react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const getHijriDate = () => {
    try {
      return new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(time);
    } catch (e) {
      console.error('Hijri date conversion not supported:', e);
      return 'Islamic Date N/A';
    }
  };

  return (
    <div className="text-right">
      <div className="text-lg font-semibold font-body text-white font-mono tracking-wider">{time.toLocaleTimeString()}</div>
      <div className="text-xs text-text-secondary-dark">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div className="text-xs text-text-secondary-dark">{getHijriDate()}</div>
    </div>
  );
};

export default LiveClock;
