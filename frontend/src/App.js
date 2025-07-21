import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would validate the token
      setUser({ token, role: 'admin' });
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setUser({ token: access_token, role: 'admin' });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Components
const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">🕌</span>
            </div>
            <h1 className="text-2xl font-bold">Prayer Compass</h1>
          </div>
          {user && (
            <button 
              onClick={logout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              Admin Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const PrayerTimeCard = ({ mosque, prayerTimes }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">{mosque.name}</h3>
        <p className="text-gray-600 text-sm">{mosque.area}</p>
        {mosque.google_maps_link && (
          <a 
            href={mosque.google_maps_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 text-sm hover:underline"
          >
            📍 View on Maps
          </a>
        )}
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <PrayerTimeItem name="Fajr" time={prayerTimes.fajr} icon="🌅" />
          <PrayerTimeItem name="Dhuhr" time={prayerTimes.dhuhr} icon="☀️" />
          <PrayerTimeItem name="Asr" time={prayerTimes.asr} icon="🌤️" />
          <PrayerTimeItem name="Maghrib" time={prayerTimes.maghrib} icon="🌅" />
          <PrayerTimeItem name="Isha" time={prayerTimes.isha} icon="🌙" />
          {prayerTimes.jummah && (
            <PrayerTimeItem name="Jummah" time={prayerTimes.jummah} icon="🕌" />
          )}
        </div>
      </div>
    </div>
  );
};

const PrayerTimeItem = ({ name, time, icon }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <span className="font-medium text-gray-700">{name}</span>
      </div>
      <span className="font-bold text-blue-600 text-lg">{time}</span>
    </div>
  );
};

const PublicView = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [mosqueData, setMosqueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCities();
  }, []);

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

  const fetchPrayerTimes = async (cityId) => {
    if (!cityId) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API}/prayer-times?city_id=${cityId}&date=${today}`);
      setMosqueData(response.data);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setMosqueData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchPrayerTimes(selectedCity);
    }
  }, [selectedCity]);

  const filteredMosqueData = mosqueData.filter(item =>
    item.mosque.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mosque.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCityName = cities.find(city => city.id === selectedCity)?.name || '';
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center bg-gradient-to-r from-blue-900/80 to-indigo-900/80"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(67, 56, 202, 0.8)), url('https://images.unsplash.com/photo-1511091734515-e50d46c37240?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxtb3NxdWV8ZW58MHx8fGJsdWV8MTc1MzA3NjIwNnww&ixlib=rb-4.1.0&q=85')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-5xl font-bold mb-4">Today's Prayer Times</h2>
            <p className="text-xl mb-8">{today}</p>
            <p className="text-lg opacity-90">Find accurate prayer timings for mosques in your city</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Mosques</label>
              <input
                type="text"
                placeholder="Search by mosque name or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Prayer Times */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading prayer times...</p>
          </div>
        ) : filteredMosqueData.length > 0 ? (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Prayer Times in {selectedCityName} ({filteredMosqueData.length} mosques)
            </h3>
            <div className="grid lg:grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredMosqueData.map(item => (
                <PrayerTimeCard 
                  key={item.mosque.id} 
                  mosque={item.mosque} 
                  prayerTimes={item.prayer_times} 
                />
              ))}
            </div>
          </div>
        ) : selectedCity ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🕌</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Prayer Times Found</h3>
            <p className="text-gray-600">Prayer times for {selectedCityName} are not available yet.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@mosque.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(email, password);
    if (!success) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-600 mt-2">Manage mosques and prayer times</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-500">Email: admin@mosque.com</p>
          <p className="text-xs text-gray-500">Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('mosques');
  const [cities, setCities] = useState([]);
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCities();
    fetchMosques();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${API}/cities`);
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchMosques = async () => {
    try {
      const response = await axios.get(`${API}/mosques`);
      setMosques(response.data);
    } catch (error) {
      console.error('Error fetching mosques:', error);
    }
  };

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${user.token}` }
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'mosques', label: 'Manage Mosques', icon: '🕌' },
                { id: 'prayer-times', label: 'Prayer Times', icon: '⏰' },
                { id: 'cities', label: 'Cities', icon: '🏙️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'mosques' && (
              <MosqueManagement 
                cities={cities} 
                mosques={mosques} 
                onUpdate={fetchMosques}
                getAuthHeaders={getAuthHeaders}
              />
            )}
            {activeTab === 'prayer-times' && (
              <PrayerTimesManagement 
                cities={cities} 
                mosques={mosques}
                getAuthHeaders={getAuthHeaders}
              />
            )}
            {activeTab === 'cities' && (
              <CityManagement 
                cities={cities} 
                onUpdate={fetchCities}
                getAuthHeaders={getAuthHeaders}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MosqueManagement = ({ cities, mosques, onUpdate, getAuthHeaders }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', city_id: '', area: '', address: '', google_maps_link: ''
  });
  const [editingMosque, setEditingMosque] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingMosque) {
        await axios.put(`${API}/admin/mosques/${editingMosque.id}`, formData, getAuthHeaders());
      } else {
        await axios.post(`${API}/admin/mosques`, formData, getAuthHeaders());
      }
      
      setFormData({ name: '', city_id: '', area: '', address: '', google_maps_link: '' });
      setShowForm(false);
      setEditingMosque(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving mosque:', error);
      alert('Error saving mosque. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mosque) => {
    setFormData({
      name: mosque.name,
      city_id: mosque.city_id,
      area: mosque.area,
      address: mosque.address || '',
      google_maps_link: mosque.google_maps_link || ''
    });
    setEditingMosque(mosque);
    setShowForm(true);
  };

  const handleDelete = async (mosqueId) => {
    if (!window.confirm('Are you sure you want to delete this mosque?')) return;
    
    try {
      await axios.delete(`${API}/admin/mosques/${mosqueId}`, getAuthHeaders());
      onUpdate();
    } catch (error) {
      console.error('Error deleting mosque:', error);
      alert('Error deleting mosque. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Mosque Management</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingMosque(null);
            setFormData({ name: '', city_id: '', area: '', address: '', google_maps_link: '' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Mosque'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-medium mb-4">
            {editingMosque ? 'Edit Mosque' : 'Add New Mosque'}
          </h4>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mosque Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={formData.city_id}
                onChange={(e) => setFormData({...formData, city_id: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link (Optional)</label>
              <input
                type="url"
                value={formData.google_maps_link}
                onChange={(e) => setFormData({...formData, google_maps_link: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingMosque ? 'Update Mosque' : 'Add Mosque'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mosques List */}
      <div className="grid gap-4">
        {mosques.map(mosque => {
          const city = cities.find(c => c.id === mosque.city_id);
          return (
            <div key={mosque.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-800">{mosque.name}</h4>
                  <p className="text-gray-600">{mosque.area}, {city?.name}</p>
                  {mosque.address && (
                    <p className="text-sm text-gray-500 mt-1">{mosque.address}</p>
                  )}
                  {mosque.google_maps_link && (
                    <a 
                      href={mosque.google_maps_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                    >
                      📍 View on Maps
                    </a>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(mosque)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(mosque.id)}
                    className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded-md hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PrayerTimesManagement = ({ cities, mosques, getAuthHeaders }) => {
  const [selectedMosque, setSelectedMosque] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '', jummah: ''
  });
  const [loading, setLoading] = useState(false);
  const [existingTimes, setExistingTimes] = useState(null);

  const fetchExistingTimes = async (mosqueId, date) => {
    if (!mosqueId || !date) return;
    
    try {
      const response = await axios.get(`${API}/prayer-times?mosque_id=${mosqueId}&date=${date}`);
      setExistingTimes(response.data);
      setPrayerTimes({
        fajr: response.data.fajr || '',
        dhuhr: response.data.dhuhr || '',
        asr: response.data.asr || '',
        maghrib: response.data.maghrib || '',
        isha: response.data.isha || '',
        jummah: response.data.jummah || ''
      });
    } catch (error) {
      setExistingTimes(null);
      setPrayerTimes({ fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '', jummah: '' });
    }
  };

  useEffect(() => {
    fetchExistingTimes(selectedMosque, selectedDate);
  }, [selectedMosque, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        mosque_id: selectedMosque,
        date: selectedDate,
        ...prayerTimes
      };
      
      // Remove empty jummah field if not Friday
      const selectedDateObj = new Date(selectedDate);
      if (selectedDateObj.getDay() !== 5) {
        delete submitData.jummah;
      }
      
      await axios.post(`${API}/admin/prayer-times`, submitData, getAuthHeaders());
      alert(existingTimes ? 'Prayer times updated successfully!' : 'Prayer times added successfully!');
    } catch (error) {
      console.error('Error saving prayer times:', error);
      alert('Error saving prayer times. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDateObj = new Date(selectedDate);
  const isFriday = selectedDateObj.getDay() === 5;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Prayer Times Management</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Mosque</label>
            <select
              value={selectedMosque}
              onChange={(e) => setSelectedMosque(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a mosque</option>
              {mosques.map(mosque => {
                const city = cities.find(c => c.id === mosque.city_id);
                return (
                  <option key={mosque.id} value={mosque.id}>
                    {mosque.name} - {city?.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {selectedMosque && (
          <div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium mb-4">
                Prayer Times {existingTimes ? '(Update Existing)' : '(Add New)'}
              </h4>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { key: 'fajr', label: 'Fajr', icon: '🌅' },
                  { key: 'dhuhr', label: 'Dhuhr', icon: '☀️' },
                  { key: 'asr', label: 'Asr', icon: '🌤️' },
                  { key: 'maghrib', label: 'Maghrib', icon: '🌅' },
                  { key: 'isha', label: 'Isha', icon: '🌙' }
                ].map(prayer => (
                  <div key={prayer.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="mr-2">{prayer.icon}</span>
                      {prayer.label}
                    </label>
                    <input
                      type="time"
                      value={prayerTimes[prayer.key]}
                      onChange={(e) => setPrayerTimes({...prayerTimes, [prayer.key]: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                ))}
                
                {isFriday && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="mr-2">🕌</span>
                      Jummah (Friday)
                    </label>
                    <input
                      type="time"
                      value={prayerTimes.jummah}
                      onChange={(e) => setPrayerTimes({...prayerTimes, jummah: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : existingTimes ? 'Update Prayer Times' : 'Add Prayer Times'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

const CityManagement = ({ cities, onUpdate, getAuthHeaders }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', country: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/admin/cities`, formData, getAuthHeaders());
      setFormData({ name: '', country: '' });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving city:', error);
      alert('Error saving city. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">City Management</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add City'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-medium mb-4">Add New City</h4>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Add City'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cities List */}
      <div className="grid gap-4">
        {cities.map(city => (
          <div key={city.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h4 className="text-lg font-medium text-gray-800">{city.name}</h4>
            <p className="text-gray-600">{city.country}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      {user ? <AdminDashboard /> : (
        <>
          <PublicView />
          <div className="fixed bottom-6 right-6">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title="Admin Login"
            >
              🔐 Admin
            </button>
          </div>
          <AdminLogin />
        </>
      )}
    </div>
  );
};

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;