import { User, Colors, Profile, Utility, Allocation } from '@/lib/types';


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
        }
    });
}