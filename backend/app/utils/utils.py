from app.models.users import Users
from app.models.colors import Colors
from app.models.utilities import Utilities
from app.models.allocations import Allocations
from app.models.disagreements import Disagreements


def get_recommender_data(recommender_name):

    current_user = Users.find_by_username(recommender_name)
    profiles = Users.get_filtered_profiles(limit_role="recommender")
    colors = Colors.get_colors()

    organization_utilities = Utilities.get_utilities_by_username(recommender_name)

    organization_allocations = Allocations.get_recommender_allocations_by_username(
        recommender_name, "budget"
    )

    return {
        "current_user": current_user,
        "users": profiles,
        "colors": colors,
        "utilities": organization_utilities,
        "allocations": organization_allocations,
        "disagreements": None,
    }


def get_funder_data(funder_name):

    current_user = Users.find_by_username(funder_name)
    profiles = Users.get_filtered_profiles(limit_role="funder")
    colors = Colors.get_colors()

    utilities = Utilities.get_all_utilities()

    recommender_names = [
        user["username"] for user in profiles if user["role"] == "recommender"
    ]
    filtered_utilities = [
        utility
        for utility in utilities
        if utility["username"] == funder_name
        or utility["username"] in recommender_names
    ]

    allocations = Allocations.get_all_allocations()

    filtered_allocations = [
        allocation
        for allocation in allocations
        if (
            allocation["from_name"] == funder_name
            or allocation["from_name"] in recommender_names
        )
        and allocation["budget_type"] == "budget"
    ]

    return {
        "current_user": current_user,
        "users": profiles,
        "colors": colors,
        "utilities": filtered_utilities,
        "allocations": filtered_allocations,
        "disagreements": None,
    }


def get_sigma_data(sigma_name):
    
    current_user = Users.find_by_username(sigma_name)
    profiles = Users.get_filtered_profiles(limit_role="sigma")
    colors = Colors.get_colors()
    utilities = Utilities.get_all_utilities()
    allocations = Allocations.get_all_allocations()
    disagreements = Disagreements.get_all_disagreements()
    
    
    return {
        "current_user": current_user,
        "users": profiles,
        "colors": colors,
        "utilities": utilities,
        "allocations": allocations,
        "disagreements": disagreements,
    }