

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

// create another interface CurrentUser. It is same as user but it also has another field called viewName
// export interface CurrentUser extends User {
//     viewName: string;
// }

export interface CurrentUser {
    user: User
    viewUser: User
}


export interface Colors {
    [key: string]: string;
}

export interface Disagreements {
    [key: string]: Record<string, number>;
}


export interface ApiData {
    current_user: User;
    users: User[];
    colors: Colors;
    utilities: Utility[];
    allocations: Allocation[];
    disagreements: Disagreements[];
}


export interface FocusUtility {
    activeUtility: string;
    hoveredUtility: string;
}



// export interface CurrentUserData {
//     user: User;
//     userInView: User;
//     activeUtility: string;
//     hoveredUtility: string;
//     utilities: Utility[];
//     allocations: Allocation[];
// }

// export interface RecommenderSidebar {
//     name: string;
//     allocation: number;
//     color: string;
// }

// export interface OrganizationSidebar {
//     name: string;
//     allocation: number;
//     colorStrip: string;
// }