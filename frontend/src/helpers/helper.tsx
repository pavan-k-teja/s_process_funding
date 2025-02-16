import { User, Colors, Profile, Utility, Allocation } from '@/lib/types';
import { String } from 'lodash';


export const shortenNumber = (number: number, k_digits: number = 3, m_digits: number = 6, k_decimal_places: number = 3, m_decimal_places: number = 1): string => {
    if (number.toString().length > m_digits) {
        return (number / 1000000).toFixed(m_decimal_places) + "M";
    } else if (number.toString().length > k_digits) {
        return (number / 1000).toFixed(k_decimal_places) + "k";
    } else {
        return number.toString();
    }
}

/*

utility format:
        {
            username: "XO", # can be a recommender, a funder
            utility_name: "BO", # can be an organization or a recommender
            fdv: 0.5, # First Dollar Value [0, 1]
            ldt: 3_000_000, # Last Dollar Threshold [non negative]
            conc: -0.54, # Concavity [-3, 3]
        }

output allocations format:
    [
        {
            name: string;
            allocation: number;
        }
    ]

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

*/


export const compute_y = (x: number, fdv: number, ldt: number, conc: number): number => {
    if (x == 0 || fdv == 0) {
        return fdv;
    }

    const exp_conc = Math.exp(conc);
    return fdv * Math.pow((1 - Math.pow(x / ldt, exp_conc)), 1 / exp_conc);
}

export const allocate_budget = (utilities: Utility[], budget: number): Allocation[] => {
    console.log("allocation started", utilities, budget);
    const n = utilities.length;
    const allocations = Array(n).fill(0);
    let remaining_budget = budget;
    const lowest_amount = Math.max(1, Math.floor(0.0001 * budget));  // Ensure at least 1 dollar

    let hold_index = null;
    for (let i = 0; i < n; i++) {
        if (utilities[i].utility_name == "_hold_") {
            hold_index = i;
            break;
        }
    }

    while (remaining_budget >= lowest_amount) {
        let max_y = -1;
        let max_y_index = -1;

        for (let i = 0; i < n; i++) {
            if (allocations[i] >= utilities[i].ldt) {
                continue;  // Skip if sufficent allocations are done
            }

            const y = compute_y(allocations[i], utilities[i].fdv, utilities[i].ldt, utilities[i].conc);
            if (y > max_y) {
                max_y = y;
                max_y_index = i;
            }
        }

        if (max_y_index == -1) {  // No more optimal allocations
            break;
        }

        allocations[max_y_index] += lowest_amount;
        remaining_budget -= lowest_amount;
    }

    if (hold_index !== null) {
        allocations[hold_index] += remaining_budget;  // Assign remaining budget to '_hold_'
    }


    return utilities.map((utility, i) => {
        return {
            from_name: utility.username,
            to_name: utility.utility_name,
            allocation_type: "budget",
            allocation: allocations[i]
        } as Allocation;
    });
}

/*

def recommender_allocations(utilities, budget):
    """
    username is the recommender's username
    budget is the recommender's budget
    utilities is a list of dictionaries with the following format:
        {
            username: "XO", # it is given that this username will be the same as the recommender's username
            utility_name: "BO", # can be an organization
            fdv: 0.5, # First Dollar Value [0, 1]
            ldt: 3_000_000, # Last Dollar Threshold [non negative]
            conc: -0.54, # Concavity [-3, 3]
        }

    we want to allocate the budget to the organizations based on the utilities like below

    def iterative_allocation(functions, total_budget):
    n = len(functions)
    allocations = [0] * n

    lowest_amount = int(0.01 * 0.01 * total_budget)
    remaining_budget = total_budget
    for _ in range(0, total_budget, lowest_amount):
        max_y = -1
        max_y_index = -1
        for i in range(n):
            x = allocations[i]
            if functions[i][1] <= x: # if the function has already reached the last dollar threshold,
                continue
            y = compute_y(x, *functions[i])
            if y > max_y:
                max_y = y
                max_y_index = i
        if max_y_index == -1:
            allocations[-1] = remaining_budget
            print("No more moves left")
            break
        print("Giving low_amt", lowest_amount, "to", max_y_index, "with y value", round(max_y, 3), " at x value", allocations[max_y_index])
        allocations[max_y_index] += lowest_amount
        remaining_budget -= lowest_amount

    return allocations

    the output we give is of this format:

    {
        organization_name: allocation,
    }


    """

    return allocate_budget(utilities, budget)


def funder_allocations(budget, funder_utilities, recommender_utilities):
    """
    username is the funder's username
    budget is the funder's budget

    funder_utilities is a list of dictionaries with the following format:
    there can be funder_utilites with username of funder and utility_name of recommender
        {
            "username": "JT", # must be the username
            "utility_name": "XO",
            "fdv": 0.82,
            "ldt": 10000000,
            "conc": 0.22
        },

    recommender_utilities is a list of dictionaries with the following format:
    there can be recommender_utilities with username of recommender and utility_name of organization
        {
            username: "XO",
            utility_name: "BO", # can be an organization
            fdv: 0.5, # First Dollar Value [0, 1]
            ldt: 3_000_000, # Last Dollar Threshold [non negative]
            conc: -0.54, # Concavity [-3, 3]
        }

    based on the funder utilities, we will allocate the budget to the recommenders,
    this will create an object using the allocation algorithm for funders to recommenders
    recommender_allocation: {
        recommender_name: allocation_value,
    }

    then, for each recommender, based on its allocation from the funder, we will call the allocation function from each recommender to organizations
    this will create an object
    recommender_to_organization_allocation: [
        {
            "recommender_name": recommender_name,
            "recommender_allocation": recommender_allocation,
            "organization_name": organization_name
            "organization_allocation": organization_allocation,
        },
    ]

    then, we will sum the organization allocations for each organization
    this will create an object
    organization_allocation: {
        organization_name: allocation,
    }

    the output we give is of this format:

    {
        recommender_allocation: {
            recommender_name: allocation_value,
        },
        recommender_to_organization_allocation: [
            {
                "recommender_name": recommender_name,
                "recommender_allocation": recommender_allocation,
                "organization_name": organization_name
                "organization_allocation": organization_allocation,
            },
        ],
        organization_allocation: {
            organization_name: allocation,
        },
    }


    """

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

*/


export const funder_allocations = (utilities: Utility[], budget: number, funderName: string, recommenderNames: string[]): Allocation[] => {

    const funderUtilities = utilities.filter(utility =>
        utility.username === funderName && recommenderNames.includes(utility.utility_name)
    );
    console.log("IMP Funder Utilities", funderUtilities);


    // Allocate budget to recommenders
    const recommenderAllocation: Allocation[] = allocate_budget(funderUtilities, budget);
    console.log("IMP Recommender Allocation: ", recommenderAllocation);


    const recommenderToOrganizationAllocation: Allocation[] = [];
    const organizationAllocation: Record<string, number> = {};

    for (const allocation of recommenderAllocation) {
        const recommenderName = allocation.to_name;
        const recommenderBudget = allocation.allocation;

        const filteredUtilities = utilities.filter(utility => utility.username === recommenderName);
        const organizationAllocations = allocate_budget(filteredUtilities, recommenderBudget);

        for (const orgAllocation of organizationAllocations) {
            recommenderToOrganizationAllocation.push({
                from_name: recommenderName,
                to_name: orgAllocation.to_name,
                allocation_type: "budget",
                allocation: orgAllocation.allocation
            });

            organizationAllocation[orgAllocation.to_name] = (organizationAllocation[orgAllocation.to_name] || 0) + orgAllocation.allocation;
        }
    }

    console.log("Complete Allocations: ", { ...recommenderAllocation, ...recommenderToOrganizationAllocation, ...organizationAllocation });

    // I just want allocations to recommenders and allocations to organizations

    return [
        ...recommenderAllocation,
        ...Object.entries(organizationAllocation).map(([orgName, amount]) => ({
            from_name: funderName,
            to_name: orgName,
            allocation_type: "budget",
            allocation: amount
        })
        )
    ]


    // return [
    //     ...recommenderAllocation,
    //     ...recommenderToOrganizationAllocation,
    //     ...Object.entries(organizationAllocation).map(([orgName, amount]) => ({
    //         from_name: "aggregated",
    //         to_name: orgName,
    //         allocation_type: "budget",
    //         allocation: amount
    //     }))
    // ];


}