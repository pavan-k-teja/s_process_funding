

export interface Profile {
    username: string;
    profile_name: string;
    role: string;
}

export interface Utility {
    _id: { $oid: string };
    username: string;
    utility_name: string;
    fdv: number;
    ldt: number;
    conc: number;
}

export interface Allocation {
    name: string;
    allocation: number;
}

export interface User {
    username: string;
    role: string;
    budget: number;
    max_budget: number;
    profile_name: string;
}


export interface Colors {
    [key: string]: string;
}


export interface RecommenderData {
    user: User;
    colors: Colors;
    utilities: Utility[];
    all_profiles: Profile[];
    allocations: Allocation[];
}


export interface RecommenderSidebar {
    name: string;
    allocation: number;
    color: string;
}

export interface OrganizationSidebar {
    name: string;
    allocation: number;
    colorStrip: string;
}