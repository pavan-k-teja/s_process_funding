import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    APP_MODE = os.getenv("APP_MODE", "development")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/grant_db")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "secret")

    if APP_MODE == "development":
        FLASK_DEBUG = True
    else:
        FLASK_DEBUG = False