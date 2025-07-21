#!/usr/bin/env python3
"""
Backend API Testing Script for Prayer Timing Tracker
Tests all backend endpoints and functionality
"""

import requests
import json
from datetime import date, datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BASE_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.test_results = []
        self.cities = []
        self.mosques = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data
        })
    
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Root Endpoint", True, f"Message: {data.get('message', 'No message')}")
                return True
            else:
                self.log_test("API Root Endpoint", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_get_cities(self):
        """Test GET /api/cities endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/cities")
            if response.status_code == 200:
                cities = response.json()
                self.cities = cities
                if len(cities) >= 2:
                    city_names = [city['name'] for city in cities]
                    self.log_test("GET Cities", True, f"Found {len(cities)} cities: {city_names}")
                    return True
                else:
                    self.log_test("GET Cities", False, f"Expected at least 2 cities, got {len(cities)}", cities)
                    return False
            else:
                self.log_test("GET Cities", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET Cities", False, f"Exception: {str(e)}")
            return False
    
    def test_get_mosques(self):
        """Test GET /api/mosques endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/mosques")
            if response.status_code == 200:
                mosques = response.json()
                self.mosques = mosques
                if len(mosques) >= 4:
                    mosque_names = [mosque['name'] for mosque in mosques]
                    self.log_test("GET Mosques", True, f"Found {len(mosques)} mosques: {mosque_names}")
                    return True
                else:
                    self.log_test("GET Mosques", False, f"Expected at least 4 mosques, got {len(mosques)}", mosques)
                    return False
            else:
                self.log_test("GET Mosques", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET Mosques", False, f"Exception: {str(e)}")
            return False
    
    def test_get_mosques_by_city(self):
        """Test GET /api/mosques with city_id filter"""
        if not self.cities:
            self.log_test("GET Mosques by City", False, "No cities available for testing")
            return False
            
        try:
            city_id = self.cities[0]['id']
            city_name = self.cities[0]['name']
            response = self.session.get(f"{API_BASE}/mosques?city_id={city_id}")
            
            if response.status_code == 200:
                mosques = response.json()
                if len(mosques) > 0:
                    mosque_names = [mosque['name'] for mosque in mosques]
                    self.log_test("GET Mosques by City", True, f"Found {len(mosques)} mosques in {city_name}: {mosque_names}")
                    return True
                else:
                    self.log_test("GET Mosques by City", False, f"No mosques found for city {city_name}", mosques)
                    return False
            else:
                self.log_test("GET Mosques by City", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET Mosques by City", False, f"Exception: {str(e)}")
            return False
    
    def test_prayer_times_by_city(self):
        """Test GET /api/prayer-times with city_id - THIS IS THE MAIN ISSUE"""
        if not self.cities:
            self.log_test("GET Prayer Times by City", False, "No cities available for testing")
            return False
            
        try:
            city_id = self.cities[0]['id']
            city_name = self.cities[0]['name']
            today = date.today().strftime('%Y-%m-%d')
            
            # Test with date parameter as 'date' (as per frontend code)
            response = self.session.get(f"{API_BASE}/prayer-times?city_id={city_id}&date={today}")
            
            if response.status_code == 200:
                prayer_times = response.json()
                if len(prayer_times) > 0:
                    self.log_test("GET Prayer Times by City", True, f"Found {len(prayer_times)} prayer times for {city_name} on {today}")
                    # Print first prayer time for debugging
                    if prayer_times:
                        first_pt = prayer_times[0]
                        print(f"   Sample prayer time: {first_pt.get('mosque', {}).get('name', 'Unknown')} - Fajr: {first_pt.get('prayer_times', {}).get('fajr', 'N/A')}")
                    return True
                else:
                    self.log_test("GET Prayer Times by City", False, f"No prayer times found for city {city_name} on {today}", prayer_times)
                    return False
            else:
                self.log_test("GET Prayer Times by City", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET Prayer Times by City", False, f"Exception: {str(e)}")
            return False
    
    def test_prayer_times_by_mosque(self):
        """Test GET /api/prayer-times with mosque_id"""
        if not self.mosques:
            self.log_test("GET Prayer Times by Mosque", False, "No mosques available for testing")
            return False
            
        try:
            mosque_id = self.mosques[0]['id']
            mosque_name = self.mosques[0]['name']
            today = date.today().strftime('%Y-%m-%d')
            
            response = self.session.get(f"{API_BASE}/prayer-times?mosque_id={mosque_id}&date={today}")
            
            if response.status_code == 200:
                prayer_times = response.json()
                self.log_test("GET Prayer Times by Mosque", True, f"Found prayer times for {mosque_name} on {today}: Fajr {prayer_times.get('fajr', 'N/A')}")
                return True
            elif response.status_code == 404:
                self.log_test("GET Prayer Times by Mosque", False, f"404 - No prayer times found for {mosque_name} on {today}", response.text)
                return False
            else:
                self.log_test("GET Prayer Times by Mosque", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET Prayer Times by Mosque", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test POST /api/auth/login with demo credentials"""
        try:
            login_data = {
                "email": "admin@mosque.com",
                "password": "admin123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                token_data = response.json()
                if 'access_token' in token_data:
                    self.admin_token = token_data['access_token']
                    self.log_test("Admin Login", True, f"Successfully logged in, token type: {token_data.get('token_type', 'unknown')}")
                    return True
                else:
                    self.log_test("Admin Login", False, "No access_token in response", token_data)
                    return False
            else:
                self.log_test("Admin Login", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_create_mosque(self):
        """Test POST /api/admin/mosques"""
        if not self.admin_token:
            self.log_test("Admin Create Mosque", False, "No admin token available")
            return False
            
        if not self.cities:
            self.log_test("Admin Create Mosque", False, "No cities available for testing")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            mosque_data = {
                "name": "Test Mosque",
                "city_id": self.cities[0]['id'],
                "area": "Test Area",
                "address": "Test Address"
            }
            
            response = self.session.post(f"{API_BASE}/admin/mosques", json=mosque_data, headers=headers)
            
            if response.status_code == 200:
                mosque = response.json()
                self.log_test("Admin Create Mosque", True, f"Created mosque: {mosque.get('name', 'Unknown')} in {mosque.get('area', 'Unknown')}")
                return True
            else:
                self.log_test("Admin Create Mosque", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Create Mosque", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_create_prayer_times(self):
        """Test POST /api/admin/prayer-times"""
        if not self.admin_token:
            self.log_test("Admin Create Prayer Times", False, "No admin token available")
            return False
            
        if not self.mosques:
            self.log_test("Admin Create Prayer Times", False, "No mosques available for testing")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            today = date.today().strftime('%Y-%m-%d')
            prayer_data = {
                "mosque_id": self.mosques[0]['id'],
                "date": today,
                "fajr": "05:30",
                "dhuhr": "12:15",
                "asr": "15:45",
                "maghrib": "18:20",
                "isha": "19:45"
            }
            
            response = self.session.post(f"{API_BASE}/admin/prayer-times", json=prayer_data, headers=headers)
            
            if response.status_code == 200:
                prayer_times = response.json()
                self.log_test("Admin Create Prayer Times", True, f"Created/updated prayer times for {today}")
                return True
            else:
                self.log_test("Admin Create Prayer Times", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Create Prayer Times", False, f"Exception: {str(e)}")
            return False
    
    def debug_database_content(self):
        """Debug: Check what's actually in the database"""
        print("\n=== DATABASE DEBUG INFORMATION ===")
        
        # Check if we can access MongoDB directly for debugging
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            import asyncio
            
            async def check_db():
                client = AsyncIOMotorClient("mongodb://localhost:27017")
                db = client["test_database"]
                
                # Check cities
                cities_count = await db.cities.count_documents({})
                print(f"Cities in DB: {cities_count}")
                
                # Check mosques  
                mosques_count = await db.mosques.count_documents({})
                print(f"Mosques in DB: {mosques_count}")
                
                # Check prayer times
                prayer_times_count = await db.prayer_times.count_documents({})
                print(f"Prayer times in DB: {prayer_times_count}")
                
                # Sample prayer times documents
                if prayer_times_count > 0:
                    sample_pt = await db.prayer_times.find_one()
                    print(f"Sample prayer time document: {sample_pt}")
                
                client.close()
            
            asyncio.run(check_db())
            
        except Exception as e:
            print(f"Could not access database directly: {e}")
        
        print("=== END DATABASE DEBUG ===\n")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests")
        print(f"Testing against: {API_BASE}")
        print("=" * 50)
        
        # Basic connectivity
        self.test_api_root()
        
        # Public endpoints
        self.test_get_cities()
        self.test_get_mosques()
        self.test_get_mosques_by_city()
        
        # Prayer times - the main issue
        self.test_prayer_times_by_city()
        self.test_prayer_times_by_mosque()
        
        # Authentication
        self.test_admin_login()
        
        # Admin operations
        self.test_admin_create_mosque()
        self.test_admin_create_prayer_times()
        
        # Debug database if prayer times are failing
        failed_prayer_tests = [r for r in self.test_results if 'Prayer Times' in r['test'] and not r['success']]
        if failed_prayer_tests:
            self.debug_database_content()
        
        # Summary
        print("=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for r in self.test_results if r['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # List failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if not success:
        print("\n🔍 CRITICAL ISSUES FOUND - Backend needs fixes before frontend can work properly")
    else:
        print("\n✅ All backend tests passed!")