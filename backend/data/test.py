from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import json


users_file = "data/users.json"
"""
users file format:

[
    {
        "username": "XO",
        "password": "XO",
        "profile_name": "XO",
        "role": "recommender",
        "budget": 10750000,
        "max_budget": 10750000
    },
    ...
]

"""

# send all users to the database


def send_users():
    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017/")

    # Select the database
    db = client["grant_db"]

    # Select the users collection
    users_collection = db["users"]

    # Read the users file
    with open(users_file, "r") as file:
        users = json.load(file)

        # hash the passwords
        for user in users:
            # password = user["password"]
            user["password"] = generate_password_hash(user["password"])
            # print(check_password_hash(user["password"], password))

    # Insert all users
    users_collection.insert_many(users)

    # Close the connection
    client.close()


send_users()
