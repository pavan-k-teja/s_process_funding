"""
format of utilities.json for mongodb utilities collection

{
    username: "XO", # can be a recommender, a funder
    utility_name: "BO", # can be an organization or a recommender
    fdv: 0.5, # First Dollar Value [0, 1]
    ldt: 3_000_000, # Last Dollar Threshold [non negative]
    conc: -0.54, # Concavity [-3, 3]
}

recommender to organization utilities are in data.csv file
the format for that is:

Companies,First Dollar Value,,,,,,Last Dollar Threshold,,,,,,Concavity,,,,,,Difference from Projected,,,,,
,BO,CF,GZ,IF,VA,XO,BO,CF,GZ,IF,VA,XO,BO,CF,GZ,IF,VA,XO,BO,CF,GZ,IF,VA,XO
BehemothCorps,0.5,1,0.81,0.66,0.43,0,3.0M,2.0M,2.1M,250K,400K,0,-0.54,-0.4,0.14,0.3,0,0,-248k,-2k,522k,-628k,-671k,-878k
BoarBrews,0.2,0.63,0,,0.72,,500k,500k,0,,654k,,0,0.3,0,,0.5,,-565k,-194k,-565k,,37k,


these are the funder to recommender utilities:

recommender_name, fdv, ldt, concavity
"BO", 0.90, 5308000, 0.00
"CF", 0.95, 4375000, 0.00
"GZ", 0.75, 8808000, 0.00
"IF", 1.00, 7658000, 0.00
"VA", 1.00, 6775000, 0.00
"XO", 0.82, 10000000, 0.22

same utilities for all funders -> recommenders

"""

import csv
import json

data = []

csv_file = "data.csv"
json_file = "utilities.json"


with open(csv_file, newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    headers = next(reader)  # Read the first row as headers
    headers = next(reader)
    usernames = ["BO", "CF", "GZ", "IF", "VA", "XO"]
    print(headers)

    for row in reader:
        org_name = row[0]  # Company name
        if not org_name:
            print("Skipping empty row")
            continue  # Skip empty rows

        for i, username in enumerate(usernames):
            org_utility = {
                "username": username,
                "utility_name": org_name,
                "fdv": float(row[i + 1]) if row[i + 1] else 0,
                "ldt": (  # row[i + 7],
                    float(row[i + 7][:-1]) * 1_000
                    if row[i + 7].endswith("k") or row[i + 7].endswith("K")
                    else (
                        float(row[i + 7][:-1]) * 1_000_000
                        if row[i + 7].endswith("m") or row[i + 7].endswith("M")
                        else float(row[i + 7]) if row[i + 7] else 0
                    )
                ),
                "conc": float(row[i + 13]) if row[i + 13] else 0,
            }

            data.append(org_utility)


# now for funder to recommender utilities

funder_usernames = ["JT", "JM", "DM"]

funder_utilities = [
    {"utility_name": "BO", "fdv": 0.90, "ldt": 5308000, "conc": 0.00},
    {"utility_name": "CF", "fdv": 0.95, "ldt": 4375000, "conc": 0.00},
    {"utility_name": "GZ", "fdv": 0.75, "ldt": 8808000, "conc": 0.00},
    {"utility_name": "IF", "fdv": 1.00, "ldt": 7658000, "conc": 0.00},
    {"utility_name": "VA", "fdv": 1.00, "ldt": 6775000, "conc": 0.00},
    {"utility_name": "XO", "fdv": 0.82, "ldt": 10000000, "conc": 0.22},
]

for funder_username in funder_usernames:
    for utility in funder_utilities:
        funder_utility = {
            "username": funder_username,
            "utility_name": utility["utility_name"],
            "fdv": utility["fdv"],
            "ldt": utility["ldt"],
            "conc": utility["conc"],
        }

        data.append(funder_utility)


print(data)

with open(json_file, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print(f"JSON data saved to {json_file}")
