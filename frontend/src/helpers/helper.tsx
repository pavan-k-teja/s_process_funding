import { Utility, Allocation } from '@/lib/types';


export const shortenNumber = (number: number, k_digits: number = 3, m_digits: number = 6, k_decimal_places: number = 3, m_decimal_places: number = 1): string => {
    if (number.toString().length > m_digits) {
        return (number / 1000000).toFixed(m_decimal_places) + "M";
    } else if (number.toString().length > k_digits) {
        return (number / 1000).toFixed(k_decimal_places) + "k";
    } else {
        return number.toString();
    }
}


export const compute_y = (x: number, fdv: number, ldt: number, conc: number): number => {
    if (x == 0 || fdv == 0) {
        return fdv;
    }

    const exp_conc = Math.exp(conc);
    return fdv * Math.pow((1 - Math.pow(x / ldt, exp_conc)), 1 / exp_conc);
}

export const allocate_budget = (utilities: Utility[], budget: number): Allocation[] => {
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

export const funder_allocations = (utilities: Utility[], budget: number, funderName: string, recommenderNames: string[]): Allocation[] => {

    const funderUtilities = utilities.filter(utility =>
        utility.username === funderName && recommenderNames.includes(utility.utility_name)
    );

    // Allocate budget to recommenders
    const recommenderAllocation: Allocation[] = allocate_budget(funderUtilities, budget);

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

}