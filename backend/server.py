from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date, timedelta
import jwt
from passlib.context import CryptContext
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security setup
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"

# Database Models
class City(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    country: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CityCreate(BaseModel):
    name: str
    country: str

class Mosque(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    city_id: str
    area: str
    address: Optional[str] = None
    google_maps_link: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MosqueCreate(BaseModel):
    name: str
    city_id: str
    area: str
    address: Optional[str] = None
    google_maps_link: Optional[str] = None

class PrayerTimes(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mosque_id: str
    date: date
    fajr: str  # Format: "05:30"
    dhuhr: str
    asr: str
    maghrib: str
    isha: str
    jummah: Optional[str] = None  # Only for Fridays
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrayerTimesCreate(BaseModel):
    mosque_id: str
    date: date
    fajr: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str
    jummah: Optional[str] = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "user"  # "admin" or "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Auth functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

# Public Routes
@api_router.get("/")
async def root():
    return {"message": "Prayer Times API"}

@api_router.get("/cities", response_model=List[City])
async def get_cities():
    cities = await db.cities.find().to_list(1000)
    return [City(**city) for city in cities]

@api_router.get("/mosques", response_model=List[Mosque])
async def get_mosques(city_id: Optional[str] = None, search: Optional[str] = None):
    query = {"is_active": True}
    if city_id:
        query["city_id"] = city_id
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"area": {"$regex": search, "$options": "i"}}
        ]
    
    mosques = await db.mosques.find(query).to_list(1000)
    return [Mosque(**mosque) for mosque in mosques]

@api_router.get("/prayer-times")
async def get_prayer_times(mosque_id: Optional[str] = None, city_id: Optional[str] = None, date: Optional[str] = None):
    target_date = datetime.strptime(date, "%Y-%m-%d").date() if date else date.today()
    
    if mosque_id:
        # Get prayer times for specific mosque
        prayer_times = await db.prayer_times.find_one({
            "mosque_id": mosque_id,
            "date": target_date.isoformat()
        })
        if prayer_times:
            return PrayerTimes(**prayer_times)
        else:
            raise HTTPException(status_code=404, detail="Prayer times not found for this date")
    
    elif city_id:
        # Get prayer times for all mosques in a city
        mosques = await db.mosques.find({"city_id": city_id, "is_active": True}).to_list(1000)
        mosque_ids = [mosque["id"] for mosque in mosques]
        
        prayer_times_list = await db.prayer_times.find({
            "mosque_id": {"$in": mosque_ids},
            "date": target_date.isoformat()
        }).to_list(1000)
        
        # Combine with mosque data
        result = []
        for mosque in mosques:
            mosque_prayer_times = next((pt for pt in prayer_times_list if pt["mosque_id"] == mosque["id"]), None)
            if mosque_prayer_times:
                result.append({
                    "mosque": Mosque(**mosque),
                    "prayer_times": PrayerTimes(**mosque_prayer_times)
                })
        
        return result
    else:
        raise HTTPException(status_code=400, detail="Either mosque_id or city_id is required")

# Auth Routes
@api_router.post("/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    # For demo purposes, create a default admin user if it doesn't exist
    admin_user = await db.users.find_one({"email": user_login.email})
    if not admin_user and user_login.email == "admin@mosque.com" and user_login.password == "admin123":
        admin_data = {
            "id": str(uuid.uuid4()),
            "email": "admin@mosque.com",
            "name": "Admin User",
            "role": "admin",
            "password_hash": get_password_hash("admin123"),
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(admin_data)
        admin_user = admin_data
    
    if not admin_user or not verify_password(user_login.password, admin_user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": admin_user["id"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Admin Routes
@api_router.post("/admin/cities", response_model=City)
async def create_city(city: CityCreate, current_user: User = Depends(get_admin_user)):
    city_obj = City(**city.dict())
    await db.cities.insert_one(city_obj.dict())
    return city_obj

@api_router.post("/admin/mosques", response_model=Mosque)
async def create_mosque(mosque: MosqueCreate, current_user: User = Depends(get_admin_user)):
    mosque_obj = Mosque(**mosque.dict())
    await db.mosques.insert_one(mosque_obj.dict())
    return mosque_obj

@api_router.put("/admin/mosques/{mosque_id}", response_model=Mosque)
async def update_mosque(mosque_id: str, mosque_update: MosqueCreate, current_user: User = Depends(get_admin_user)):
    update_data = mosque_update.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.mosques.update_one(
        {"id": mosque_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Mosque not found")
    
    updated_mosque = await db.mosques.find_one({"id": mosque_id})
    return Mosque(**updated_mosque)

@api_router.delete("/admin/mosques/{mosque_id}")
async def delete_mosque(mosque_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.mosques.update_one(
        {"id": mosque_id},
        {"$set": {"is_active": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Mosque not found")
    
    return {"message": "Mosque deleted successfully"}

@api_router.post("/admin/prayer-times", response_model=PrayerTimes)
async def create_prayer_times(prayer_times: PrayerTimesCreate, current_user: User = Depends(get_admin_user)):
    # Check if prayer times already exist for this mosque and date
    existing = await db.prayer_times.find_one({
        "mosque_id": prayer_times.mosque_id,
        "date": prayer_times.date.isoformat()
    })
    
    prayer_times_obj = PrayerTimes(**prayer_times.dict())
    
    if existing:
        # Update existing
        prayer_times_dict = prayer_times_obj.dict()
        prayer_times_dict["date"] = prayer_times_dict["date"].isoformat()
        await db.prayer_times.update_one(
            {"id": existing["id"]},
            {"$set": prayer_times_dict}
        )
    else:
        # Create new
        prayer_times_dict = prayer_times_obj.dict()
        prayer_times_dict["date"] = prayer_times_dict["date"].isoformat()
        await db.prayer_times.insert_one(prayer_times_dict)
    
    return prayer_times_obj

# Initialize sample data
async def init_sample_data():
    # Check if data already exists
    existing_cities = await db.cities.count_documents({})
    if existing_cities > 0:
        return
    
    # Create sample cities
    cities = [
        City(name="Karachi", country="Pakistan"),
        City(name="Lahore", country="Pakistan")
    ]
    
    for city in cities:
        await db.cities.insert_one(city.dict())
    
    # Create sample mosques
    karachi_id = cities[0].id
    lahore_id = cities[1].id
    
    mosques = [
        Mosque(name="Masjid-e-Tooba", city_id=karachi_id, area="Defence", address="Defence Housing Authority, Karachi"),
        Mosque(name="Grand Jamia Mosque", city_id=karachi_id, area="Bahria Town", address="Bahria Town, Karachi"),
        Mosque(name="Badshahi Mosque", city_id=lahore_id, area="Walled City", address="Old City, Lahore"),
        Mosque(name="Masjid-e-Shuhada", city_id=lahore_id, area="Model Town", address="Model Town, Lahore")
    ]
    
    for mosque in mosques:
        await db.mosques.insert_one(mosque.dict())
    
    # Create sample prayer times for today
    today = date.today()
    sample_times = [
        {"fajr": "05:30", "dhuhr": "12:15", "asr": "15:45", "maghrib": "18:20", "isha": "19:45"},
        {"fajr": "05:28", "dhuhr": "12:18", "asr": "15:48", "maghrib": "18:22", "isha": "19:47"},
        {"fajr": "05:25", "dhuhr": "12:10", "asr": "15:40", "maghrib": "18:15", "isha": "19:40"},
        {"fajr": "05:27", "dhuhr": "12:12", "asr": "15:42", "maghrib": "18:17", "isha": "19:42"}
    ]
    
    for i, mosque in enumerate(mosques):
        times = sample_times[i]
        prayer_times = PrayerTimes(
            mosque_id=mosque.id,
            date=today,
            **times
        )
        if today.weekday() == 4:  # Friday
            prayer_times.jummah = "13:00"
        
        # Convert date to string for MongoDB
        prayer_times_dict = prayer_times.dict()
        prayer_times_dict["date"] = prayer_times_dict["date"].isoformat()
        await db.prayer_times.insert_one(prayer_times_dict)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    await init_sample_data()
    logger.info("Sample data initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()