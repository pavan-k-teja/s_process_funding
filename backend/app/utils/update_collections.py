import math
import json
from ..extensions import mongo

db = mongo.db


def clear_allocations_disagreements():
    collections = db.list_collection_names()
    if "allocations" in collections:
        db["allocations"].drop()
    if "disagreements" in collections:
        db["disagreements"].drop()



def compute_y(x, fdv, ldt, conc):
    if x == 0 or fdv == 0:
        return fdv

    exp_conc = math.exp(conc)
    return fdv * ((1 - (x / ldt) ** exp_conc) ** (1 / exp_conc))


def allocate_budget(utilities, budget):
    n = len(utilities)
    allocations = [0] * n
    remaining_budget = budget
    lowest_amount = max(1, math.floor(0.0001 * budget))  # Ensure at least 1 dollar

    hold_index = None
    for i in range(n):
        if utilities[i]["utility_name"] == "_hold_":
            hold_index = i
            break

    while remaining_budget >= lowest_amount:
        max_y, max_y_index = -1, -1

        for i, utility in enumerate(utilities):
            if allocations[i] >= utility["ldt"]:
                continue  # Skip if sufficient allocations are done

            y = compute_y(
                allocations[i], utility["fdv"], utility["ldt"], utility["conc"]
            )
            if y > max_y:
                max_y, max_y_index = y, i

        if max_y_index == -1:  # No more optimal allocations
            break

        allocations[max_y_index] += lowest_amount
        remaining_budget -= lowest_amount

    if hold_index is not None:
        allocations[hold_index] += remaining_budget  # Assign remaining budget to '_hold_'

    return {
        utility["utility_name"]: allocation
        for utility, allocation in zip(utilities, allocations)
    }


def recommender_allocations(utilities, budget):
    return allocate_budget(utilities, budget)


def funder_allocations(budget, funder_utilities, recommender_utilities):
    recommender_allocation = allocate_budget(funder_utilities, budget)

    recommender_to_organization_allocation = []
    organization_allocation = {}

    for recommender_name, recommender_budget in recommender_allocation.items():
        recommender_utilities_filtered = [
            u for u in recommender_utilities if u["username"] == recommender_name
        ]  # utilities for the current recommender
        organization_allocations = allocate_budget(
            recommender_utilities_filtered, recommender_budget
        )

        for org_name, org_budget in organization_allocations.items():
            recommender_to_organization_allocation.append(
                {
                    "recommender_name": recommender_name,
                    "recommender_allocation": recommender_budget,
                    "organization_name": org_name,
                    "organization_allocation": org_budget,
                }
            )
            organization_allocation[org_name] = (
                organization_allocation.get(org_name, 0) + org_budget
            )

    return {
        "recommender_allocation": recommender_allocation,
        "recommender_to_organization_allocation": recommender_to_organization_allocation,
        "organization_allocation": organization_allocation,
    }


def projected_final_allocations(funder_info, utilities):
    funder_to_recommender_allocation = []
    recommender_allocation = {}
    recommender_to_organization_allocation = []
    organization_allocation = {}

    # separate the utilities based on username
    user_to_utilities = {}
    for utility in utilities:
        if utility["username"] not in user_to_utilities:
            user_to_utilities[utility["username"]] = []
        user_to_utilities[utility["username"]].append(utility)

    for funder_name, funder_budget in funder_info.items():
        funder_utilities = user_to_utilities.get(funder_name, [])

        funder_recommender_allocations = allocate_budget(
            funder_utilities, funder_budget
        )

        for recommender_name, recommender_budget in funder_recommender_allocations.items():
            funder_to_recommender_allocation.append(
                {
                    "funder_name": funder_name,
                    "funder_allocation": funder_budget,
                    "recommender_name": recommender_name,
                    "recommender_allocation": recommender_budget,
                }
            )

            recommender_allocation[recommender_name] = (
                recommender_allocation.get(recommender_name, 0) + recommender_budget
            )

    for recommender_name, recommender_budget in recommender_allocation.items():
        recommender_utilities = user_to_utilities.get(recommender_name, [])

        org_allocations = allocate_budget(recommender_utilities, recommender_budget)

        for org_name, org_budget in org_allocations.items():
            recommender_to_organization_allocation.append(
                {
                    "recommender_name": recommender_name,
                    "recommender_allocation": recommender_budget,
                    "organization_name": org_name,
                    "organization_allocation": org_budget,
                }
            )

            organization_allocation[org_name] = (
                organization_allocation.get(org_name, 0) + org_budget
            )

    return {
        "funder_to_recommender_allocation": funder_to_recommender_allocation,
        "recommender_allocation": recommender_allocation,
        "recommender_to_organization_allocation": recommender_to_organization_allocation,
        "organization_allocation": organization_allocation,
    }


def insert_own_allocations(user, utilities, total_funds):
    own_recommender_alloc = recommender_allocations(utilities, user["budget"])
    total_recommender_alloc = recommender_allocations(utilities, total_funds)
    
    complete_own_allocations = []

    for recommender, alloc in own_recommender_alloc.items():
        complete_own_allocations.append(
            {
                "from_name": user["username"],
                "to_name": recommender,
                "allocation_type": "budget",
                "allocation": alloc,
            }
        )

    for org, alloc in total_recommender_alloc.items():
        complete_own_allocations.append(
            {
                "from_name": user["username"],
                "to_name": org,
                "allocation_type": "total_funds",
                "allocation": alloc,
            }
        )
        
    return complete_own_allocations


def insert_funder_allocations(user, funder_utilities, recommender_utilities, total_funds):
    own_funder_alloc = funder_allocations(
        user["budget"], funder_utilities, recommender_utilities
    )
    total_funder_alloc = funder_allocations(
        total_funds, funder_utilities, recommender_utilities
    )
    
    complete_funder_allocations = []

    for recommender, alloc in own_funder_alloc["recommender_allocation"].items():
        complete_funder_allocations.append({
            "from_name": user["username"],
            "to_name": recommender,
            "allocation_type": "budget",
            "allocation": alloc,
        })

    for org, alloc in own_funder_alloc["organization_allocation"].items():
        complete_funder_allocations.append(
            {
                "from_name": user["username"],
                "to_name": org,
                "allocation_type": "budget",
                "allocation": alloc,
            }
        )

    for recommender, alloc in total_funder_alloc["recommender_allocation"].items():
        complete_funder_allocations.append(
            {
                "from_name": user["username"],
                "to_name": recommender,
                "allocation_type": "total_funds",
                "allocation": alloc,
            }
        )

    for org, alloc in total_funder_alloc["organization_allocation"].items():
        complete_funder_allocations.append(
            {
                "from_name": user["username"],
                "to_name": org,
                "allocation_type": "total_funds",
                "allocation": alloc,
            }
        )
        
    return complete_funder_allocations


def insert_projected_final_allocations(projected_final_alloc):
    complete_final_allocations = []
    
    for recommender, alloc in projected_final_alloc["recommender_allocation"].items():
        complete_final_allocations.append(
            {
                "from_name": "sigma",
                "to_name": recommender,
                "allocation_type": "budget",
                "allocation": alloc,
            }
        )

    for org, alloc in projected_final_alloc["organization_allocation"].items():
        complete_final_allocations.append(
            {
                "from_name": "sigma",
                "to_name": org,
                "allocation_type": "budget",
                "allocation": alloc,
            }
        )

    for alloc in projected_final_alloc["recommender_to_organization_allocation"]:
        complete_final_allocations.append(
            {
                "from_name": alloc["recommender_name"],
                "to_name": alloc["organization_name"],
                "allocation_type": "funders",
                "allocation": alloc["organization_allocation"],
            }
        )
        
    return complete_final_allocations


def insert_allocations():
    recommenders = list(db["users"].find({"role": "recommender"}))
    funders = list(db["users"].find({"role": "funder"}))
    utilities = list(db["utilities"].find())

    total_funds = sum([f["budget"] for f in funders])
    
    complete_allocations = []
    

    for user in recommenders:
        recommender_utilities = [
            u for u in utilities if u["username"] == user["username"]
        ]
        complete_allocations.append(insert_own_allocations(user, recommender_utilities, total_funds))

    for user in funders:
        funder_utilities = [u for u in utilities if u["username"] == user["username"]]
        recommender_utilities = [
            u for u in utilities if u["username"] in [r["username"] for r in recommenders]
        ]
        complete_allocations.append(insert_funder_allocations(
            user, funder_utilities, recommender_utilities, total_funds
        ))

    funder_info = {funder["username"]: funder["budget"] for funder in funders}
    projected_final_alloc = projected_final_allocations(funder_info, utilities)
    complete_allocations.append(insert_projected_final_allocations(projected_final_alloc))
    
    return complete_allocations


def insert_disagreements():
    
    complete_disagreements = []
    
    users = list(db["users"].find())
    recommenders = list(db["users"].find({"role": "recommender"}))
    funders = list(db["users"].find({"role": "funder"}))
    allocations = list(db["allocations"].find())

    sigma_allocations = [
        a for a in allocations if a["from_name"] == "sigma" and a["to_name"] not in [u["username"] for u in users]
    ]

    organizations = list(set([a["to_name"] for a in sigma_allocations]))

    recommender_disagreements = []
    for recommender in recommenders:
        recommender_total_allocations = [
            a for a in allocations if a["from_name"] == recommender["username"] and a["allocation_type"] == "total_funds"
        ]

        disagreements = {}
        for org in organizations:
            sigma_allocation = next((a for a in sigma_allocations if a["to_name"] == org), None)
            recommender_allocation = next((a for a in recommender_total_allocations if a["to_name"] == org), None)

            if sigma_allocation and recommender_allocation:
                disagreements[org] = sigma_allocation["allocation"] - recommender_allocation["allocation"]
            else:
                disagreements[org] = None

        recommender_disagreements.append({recommender["username"]: disagreements})

    complete_disagreements.append(recommender_disagreements)
    # db["disagreements"].insert_many(recommender_disagreements)

    funder_disagreements = []
    for funder in funders:
        funder_total_allocations = [
            a for a in allocations if a["from_name"] == funder["username"] and a["allocation_type"] == "total_funds"
        ]

        disagreements = {}
        for org in organizations:
            sigma_allocation = next((a for a in sigma_allocations if a["to_name"] == org), None)
            funder_allocation = next((a for a in funder_total_allocations if a["to_name"] == org), None)

            if sigma_allocation and funder_allocation:
                disagreements[org] = sigma_allocation["allocation"] - funder_allocation["allocation"]
            else:
                disagreements[org] = None

        funder_disagreements.append({funder["username"]: disagreements})

    complete_disagreements.append(funder_disagreements)
    # db["disagreements"].insert_many(funder_disagreements)
    
    return complete_disagreements


def update_collections():
    # clear_allocations_disagreements()
    complete_allocations = insert_allocations()
    complete_disagreements = insert_disagreements()
    
    # remove existing allocations and disagreements and complete change
    db["allocations"].drop()
    db["disagreements"].drop()
    
    db["allocations"].insert_many([a for a in complete_allocations])
    db["disagreements"].insert_many([d for d in complete_disagreements])


if __name__ == "__main__":
    update_collections()
