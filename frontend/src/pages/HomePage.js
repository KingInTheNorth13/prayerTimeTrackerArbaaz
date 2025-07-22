import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PrayerTimeCard from '../components/PrayerTimeCard';
import PrayerTimeCardSkeleton from '../components/PrayerTimeCardSkeleton';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://localhost:7056';
const API = `${API_BASE_URL}/api`;

const HomePage = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [mosqueData, setMosqueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${API}/cities`);
        setCities(response.data);
        if (response.data.length > 0) {
          setSelectedCity(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (!selectedCity) return;

    const fetchPrayerTimes = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`${API}/prayer-times?city_id=${selectedCity}&date=${today}`);
        setMosqueData(response.data);
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        setMosqueData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  const filteredMosques = mosqueData.filter(m =>
    m.mosque_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="text-center pt-8 pb-16">
        <h1 className="text-5xl md:text-7xl font-bold font-heading text-white drop-shadow-lg">Path to Prayer</h1>
        <p className="text-lg text-text-secondary-dark mt-4">Find tranquility and accurate prayer times.</p>
      </div>

      <div className="sticky top-20 z-30 bg-black/20 backdrop-blur-md p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full p-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-accent-purple focus:outline-none"
        >
          {cities.map(city => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search for a mosque..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-accent-purple focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [...Array(6)].map((_, i) => <PrayerTimeCardSkeleton key={i} />)
        ) : filteredMosques.length > 0 ? (
          filteredMosques.map(data => (
            <PrayerTimeCard key={data.mosque_id} data={data} />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="text-xl text-text-secondary-dark">No prayer times found for this city or search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
