"""

format of users.json for mongodb users collection

{
    username: "XO",
    password: "XO",
    profile_name: "XO",
    role: "recommender",
    budget: 10750000,
    max_budget: 10750000,
}


users:
    recommender:
        XO
        VA
        IF
        GZ
        CF
        BO
    
    funder:
        JT
        JM
        DM
        
    sigma:
        sigma
        
    password is the same as the username
    profile name is also the same as the username except for sigma
    profile name for sigma = "Σ"
    
    
    for recommender, budget = max_budget = 10_750_000
    for funder, budget = max_budget = 10_000_000
    for sigma, budget doesn't mean anything, so budget = max_budget = 0

"""

import json

users = {
    "recommender": ["XO", "VA", "IF", "GZ", "CF", "BO"],
    "funder": ["JT", "JM", "DM"],
    "sigma": ["SIGMA"],
}

data = []

for role, usernames in users.items():
    for username in usernames:
        user = {
            "username": username,
            "password": username,
            "profile_name": username if username != "SIGMA" else "Σ",
            "role": role,
            "budget": (
                10750000
                if role == "recommender"
                else 10000000 if role == "funder" else 0
            ),
            "max_budget": (
                10750000
                if role == "recommender"
                else 10000000 if role == "funder" else 0
            ),
        }

        data.append(user)

print(data)

with open("users.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print(f"JSON data saved to users.json")
