
#  we ll parse utility_to_colors csv and create a dictionary of utility to colors
# then we send to mongodb collection name colors

import csv
import json
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["grant_db"]
colors_collection = db["colors"]

utility_to_colors = {}
with open("utility_to_color.csv", "r") as file:
    reader = csv.reader(file)
    for row in reader:
        utility_to_colors[row[0]] = row[1]
        
# colors_collection.insert_one(utility_to_colors)
print(utility_to_colors)

colors_collection.insert_one(utility_to_colors)

# now test the read colors and print

colors = colors_collection.find_one()
print("Reading colors")
print(colors)
