

export interface Profile {
    username: string;
    profile_name: string;
    role: string;
}

export interface Utility {
    username: string;
    utility_name: string;
    fdv: number;
    ldt: number;
    conc: number;
}

export interface Allocation {
    from_name: string;
    to_name: string;
    allocation_type: string;
    allocation: number;
}

export interface User {
    username: string;
    profile_name: string;
    role: string;
    budget: number;
    max_budget: number;
}

export interface CurrentUser {
    user: User
    viewUser: User
}


export interface Colors {
    [key: string]: string;
}

export interface Disagreements {
    [key: string]: {
        [key: string]: number;
    }
}


export interface ApiData {
    current_user: User;
    users: User[];
    colors: Colors;
    utilities: Utility[];
    allocations: Allocation[];
    disagreements: Disagreements;
}


export interface FocusUtility {
    activeUtility: string;
    hoveredUtility: string;
}

export interface ChangeDetection {
    isUtilityChanged: boolean;
    isBudgetChanged: number;
}

export enum UserRole {
    Recommender = "recommender",
    Funder = "funder",
    Sigma = "sigma"
};

