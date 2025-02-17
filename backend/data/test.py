import math
import time
import json

from pymongo import MongoClient
from werkzeug.security import generate_password_hash


def compute_y(x, fdv, ldt, conc):  # not all edge cases are covered
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

    # for _ in range(0, budget, lowest_amount):
    while remaining_budget >= lowest_amount:
        max_y, max_y_index = -1, -1

        for i, utility in enumerate(utilities):
            if allocations[i] >= utility["ldt"]:
                continue  # Skip if sufficent allocations are done

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
        allocations[
            hold_index
        ] += remaining_budget  # Assign remaining budget to '_hold_'

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

        for (
            recommender_name,
            recommender_budget,
        ) in funder_recommender_allocations.items():
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


def test_recommender_allocations(db):

    try:

        # drop db["recommender_allocations"]
        db["recommender_allocations"].drop()

        # get all users with role == "recommender"
        users_collection = db["users"]
        recommender_users = users_collection.find({"role": "recommender"})

        recommender_allocations = []
        for recommender_user in recommender_users:
            utilities_collection = db["utilities"]
            recommender_utilities = utilities_collection.find(
                {"username": recommender_user["username"]}
            )
            print(type(recommender_utilities))

            allocation = allocate_budget(
                list(recommender_utilities), recommender_user["budget"]
            )
            recommender_allocation = {
                "username": recommender_user["username"],
                "budget": recommender_user["budget"],
                "budget_type": "own",
                "org_allocation": allocation,
            }

            recommender_allocations.append(recommender_allocation)

        # send recommender_allocations to the db collection "recommender_allocations"
        recommender_allocations_collection = db["recommender_allocations"]
        recommender_allocations_collection.insert_many(recommender_allocations)

    except Exception as e:
        print(e)


def test_funder_allocations():

    try:
        username = "JT"
        budget = 10_000_000

        utility_file = "utilities.json"

        # funder_utility_file = "funder_utilities.json"
        # recommender_utility_file = "recommender_utilities.json"

        with open(utility_file, "r", encoding="utf-8") as f:
            utilities = json.load(f)

        funder_utilities = [
            utility for utility in utilities if utility["username"] == username
        ]

        recommender_names = set(utility["utility_name"] for utility in funder_utilities)

        recommender_utilities = [
            utility for utility in utilities if utility["username"] in recommender_names
        ]

        start_time = time.time()
        result = funder_allocations(budget, funder_utilities, recommender_utilities)
        end_time = time.time()

        print(f"Time taken: {(end_time - start_time) * 1000} ms\n")
        print("Recommender Name", "Allocation")
        for recommender_name, allocation in sorted(
            result["recommender_allocation"].items(), key=lambda x: x[1], reverse=True
        ):
            print(recommender_name, allocation)

        print("\nRecommender Name", "Organization Name", "Allocation")
        for entry in result["recommender_to_organization_allocation"]:
            print(
                entry["recommender_name"],
                entry["organization_name"],
                entry["organization_allocation"],
            )

        print("\nOrganization Name", "Allocation")
        for org_name, allocation in sorted(
            result["organization_allocation"].items(), key=lambda x: x[1], reverse=True
        ):
            print(org_name, allocation)

        print(f"Time taken: {(end_time - start_time) * 1000} ms")

    except Exception as e:
        print(e)


def test_projected_final_allocations():

    try:
        funder_info = {
            "JT": 10_000_000,
            "JM": 250_000,
            "DM": 500_000,
        }

        utility_file = "utilities.json"

        with open(utility_file, "r", encoding="utf-8") as f:
            utilities = json.load(f)

        start_time = time.time()
        result = projected_final_allocations(funder_info, utilities)
        end_time = time.time()

        print(f"Time taken: {(end_time - start_time) * 1000} ms\n")
        print("Funder Name", "Recommender Name", "Allocation")
        for entry in result["funder_to_recommender_allocation"]:
            print(
                entry["funder_name"],
                entry["recommender_name"],
                entry["recommender_allocation"],
            )

        print("\nRecommender Name", "Allocation")
        for recommender_name, allocation in sorted(
            result["recommender_allocation"].items(), key=lambda x: x[1], reverse=True
        ):
            print(recommender_name, allocation)

        print("\nRecommender Name", "Organization Name", "Allocation")
        for entry in result["recommender_to_organization_allocation"]:
            print(
                entry["recommender_name"],
                entry["organization_name"],
                entry["organization_allocation"],
            )

        print("\nOrganization Name", "Allocation")
        for org_name, allocation in sorted(
            result["organization_allocation"].items(), key=lambda x: x[1], reverse=True
        ):
            print(org_name, allocation)

        print(f"Time taken: {(end_time - start_time) * 1000} ms")

    except Exception as e:
        print(e)


if __name__ == "__main__":

    users_json_file = "./initial_files/users.json"
    utilities_json_file = "./initial_files/utilities.json"

    # create a connection to the database
    client = MongoClient("mongodb://localhost:27017/")
    db = client["grant_db"]

    # step -1 drop all the collections if they exist
    db["users"].drop()
    db["utilities"].drop()

    # send all users to the database
    # create a collection for users if it does not exist

    users_collection = db["users"]
    with open(users_json_file, "r") as file:
        users = json.load(file)
        for user in users:
            user["password"] = generate_password_hash(user["password"])
        users_collection.insert_many(users)

    # send all utilities to the database
    # create a collection for utilities if it does not exist

    utilities_collection = db["utilities"]
    with open(utilities_json_file, "r") as file:
        utilities = json.load(file)
        utilities_collection.insert_many(utilities)

    test_recommender_allocations(db)

    # test_funder_allocations()
    # test_projected_final_allocations()
