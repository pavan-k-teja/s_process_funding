from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager

db = PyMongo()
jwt = JWTManager()
