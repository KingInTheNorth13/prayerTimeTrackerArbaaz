import React from 'react';
import LiveClock from './LiveClock';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-black bg-opacity-20 backdrop-blur-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-gold" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          <h1 className="text-2xl font-bold font-heading text-white">Sa‘at al-Sujood</h1>
        </div>
        <LiveClock />
      </div>
    </header>
  );
};

export default Header;

