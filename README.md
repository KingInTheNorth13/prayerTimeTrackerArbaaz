# Here are your Instructions
# Here are your Instructions
Prayer Time Tracker Codebase Explanation
This is a full-stack web application for tracking prayer times across multiple cities and mosques. Here's a comprehensive breakdown:

🏗️ Architecture Overview
Backend: FastAPI (Python) with MongoDB
Frontend: React with Tailwind CSS
Testing: Comprehensive test suite with automated validation
📁 Project Structure
Backend (/backend/)
server.py
 - Main FastAPI application with:
REST API endpoints (/api prefix)
JWT-based authentication system
MongoDB integration using Motor (async driver)
Role-based access control (admin/user)

Frontend (/frontend/)
React application with modern stack:
React 19, React Router for navigation
Axios for API communication
Tailwind CSS for styling
CRACO for build configuration

Testing
backend_test.py
 - Your current file, comprehensive test suite
backend_test_additional.py
c:\Users\arbaaz.khan\Downloads\prayerTimeTrackerArbaaz-main\prayerTimeTrackerArbaaz-main\backend_test_additional.py
 - Extended test scenarios
test_result.md
 - Test documentation
🔧 Key Features
Data Models
City: Name, country, creation timestamp
Mosque: Name, city association, area, address, Google Maps link
PrayerTimes: Five daily prayers + Jummah, date-specific
User: Email, name, role (admin/user)
API Endpoints
Public Routes:

GET /api/cities - List all cities
GET /api/mosques - List mosques (filterable by city/search)
GET /api/prayer-times - Get prayer times (by mosque/city/date)
Admin Routes (require authentication):

CRUD operations for cities, mosques, and prayer times
User management and authentication
Authentication
JWT token-based system
Password hashing with bcrypt
Role-based permissions (admin vs regular user)
🧪 Testing Suite (
backend_test.py
)
Your current file is a comprehensive testing framework that validates:

All API endpoints
Authentication flows
Data validation
Error handling
CRUD operations
The 
BackendTester
 class systematically tests every aspect of the backend API, making it an excellent reference for understanding the application's functionality.

🚀 Technology Stack
Backend: FastAPI, MongoDB, JWT, bcrypt, Motor
Frontend: React, Tailwind CSS, Axios, React Router
Testing: Custom Python test framework with detailed reporting
This codebase represents a well-structured, production-ready application for managing prayer times across multiple locations with proper authentication and comprehensive testing.