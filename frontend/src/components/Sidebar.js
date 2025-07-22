import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navigationLinks = [
  { to: '/', text: 'Home', icon: 'home' },
  { to: '/admin', text: 'Admin', icon: 'shield' },
];

const Icon = ({ name, className }) => {
  const icons = {
    home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.944c0 4.96-4.03 9-9 9s-9-4.04-9-9z" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
  };

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name]}
    </svg>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {

  return (
    <aside className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col`}>
      <div className="flex items-center justify-center h-20 border-b border-white/10">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10">
          <Icon name={isCollapsed ? 'menu' : 'close'} className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-grow mt-4">
        <ul className="space-y-2 px-4">
          {navigationLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-accent-purple text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`
                }
              >
                <Icon name={link.icon} className="h-6 w-6" />
                <span className={`ml-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{link.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
