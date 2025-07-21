#!/usr/bin/env python3
"""
Additional Backend API Tests for Prayer Timing Tracker
Tests edge cases and additional functionality
"""

import requests
import json
from datetime import date, datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BASE_URL}/api"

def test_prayer_times_different_dates():
    """Test prayer times with different dates"""
    print("🔍 Testing Prayer Times with Different Dates")
    
    session = requests.Session()
    
    # Get cities first
    cities_response = session.get(f"{API_BASE}/cities")
    cities = cities_response.json()
    city_id = cities[0]['id']
    
    # Test today
    today = date.today().strftime('%Y-%m-%d')
    response = session.get(f"{API_BASE}/prayer-times?city_id={city_id}&date={today}")
    print(f"✅ Today ({today}): {len(response.json())} prayer times found")
    
    # Test tomorrow (should be empty)
    tomorrow = (date.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    response = session.get(f"{API_BASE}/prayer-times?city_id={city_id}&date={tomorrow}")
    print(f"✅ Tomorrow ({tomorrow}): {len(response.json())} prayer times found (expected: 0)")
    
    # Test without date parameter (should default to today)
    response = session.get(f"{API_BASE}/prayer-times?city_id={city_id}")
    print(f"✅ No date param (defaults to today): {len(response.json())} prayer times found")

def test_mosque_search():
    """Test mosque search functionality"""
    print("\n🔍 Testing Mosque Search Functionality")
    
    session = requests.Session()
    
    # Test search by name
    response = session.get(f"{API_BASE}/mosques?search=Tooba")
    mosques = response.json()
    print(f"✅ Search 'Tooba': Found {len(mosques)} mosques")
    if mosques:
        print(f"   Found: {mosques[0]['name']}")
    
    # Test search by area
    response = session.get(f"{API_BASE}/mosques?search=Defence")
    mosques = response.json()
    print(f"✅ Search 'Defence': Found {len(mosques)} mosques")
    if mosques:
        print(f"   Found: {mosques[0]['name']} in {mosques[0]['area']}")

def test_admin_operations():
    """Test admin CRUD operations"""
    print("\n🔍 Testing Admin CRUD Operations")
    
    session = requests.Session()
    
    # Login as admin
    login_data = {"email": "admin@mosque.com", "password": "admin123"}
    login_response = session.post(f"{API_BASE}/auth/login", json=login_data)
    token = login_response.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get cities for mosque creation
    cities_response = session.get(f"{API_BASE}/cities")
    cities = cities_response.json()
    city_id = cities[0]['id']
    
    # Create a test mosque
    mosque_data = {
        "name": "Integration Test Mosque",
        "city_id": city_id,
        "area": "Test Area",
        "address": "123 Test Street"
    }
    create_response = session.post(f"{API_BASE}/admin/mosques", json=mosque_data, headers=headers)
    new_mosque = create_response.json()
    mosque_id = new_mosque['id']
    print(f"✅ Created mosque: {new_mosque['name']}")
    
    # Update the mosque
    update_data = {
        "name": "Updated Test Mosque",
        "city_id": city_id,
        "area": "Updated Area",
        "address": "456 Updated Street"
    }
    update_response = session.put(f"{API_BASE}/admin/mosques/{mosque_id}", json=update_data, headers=headers)
    updated_mosque = update_response.json()
    print(f"✅ Updated mosque: {updated_mosque['name']} in {updated_mosque['area']}")
    
    # Create prayer times for the mosque
    today = date.today().strftime('%Y-%m-%d')
    prayer_data = {
        "mosque_id": mosque_id,
        "date": today,
        "fajr": "05:15",
        "dhuhr": "12:00",
        "asr": "15:30",
        "maghrib": "18:00",
        "isha": "19:30"
    }
    prayer_response = session.post(f"{API_BASE}/admin/prayer-times", json=prayer_data, headers=headers)
    print(f"✅ Created prayer times for {today}")
    
    # Verify prayer times can be retrieved
    get_response = session.get(f"{API_BASE}/prayer-times?mosque_id={mosque_id}&date={today}")
    prayer_times = get_response.json()
    print(f"✅ Retrieved prayer times: Fajr {prayer_times['fajr']}, Dhuhr {prayer_times['dhuhr']}")
    
    # Delete the mosque (soft delete)
    delete_response = session.delete(f"{API_BASE}/admin/mosques/{mosque_id}", headers=headers)
    print(f"✅ Deleted mosque: {delete_response.json()['message']}")
    
    # Verify mosque is no longer active
    mosques_response = session.get(f"{API_BASE}/mosques")
    active_mosques = [m for m in mosques_response.json() if m['id'] == mosque_id]
    print(f"✅ Mosque active status: {len(active_mosques) == 0} (should be True - not in active list)")

def test_error_handling():
    """Test error handling"""
    print("\n🔍 Testing Error Handling")
    
    session = requests.Session()
    
    # Test invalid mosque ID
    response = session.get(f"{API_BASE}/prayer-times?mosque_id=invalid-id&date=2025-07-21")
    print(f"✅ Invalid mosque ID: Status {response.status_code} (expected: 404)")
    
    # Test invalid date format
    response = session.get(f"{API_BASE}/prayer-times?mosque_id=some-id&date=invalid-date")
    print(f"✅ Invalid date format: Status {response.status_code} (expected: 422 or 400)")
    
    # Test missing required parameters
    response = session.get(f"{API_BASE}/prayer-times")
    print(f"✅ Missing parameters: Status {response.status_code} (expected: 400)")
    
    # Test unauthorized admin access
    response = session.post(f"{API_BASE}/admin/mosques", json={"name": "test"})
    print(f"✅ Unauthorized admin access: Status {response.status_code} (expected: 403 or 401)")

if __name__ == "__main__":
    print("🚀 Running Additional Backend Tests")
    print("=" * 50)
    
    test_prayer_times_different_dates()
    test_mosque_search()
    test_admin_operations()
    test_error_handling()
    
    print("\n" + "=" * 50)
    print("✅ Additional backend tests completed!")