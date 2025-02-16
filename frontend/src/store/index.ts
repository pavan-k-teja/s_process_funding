import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { Allocation, Colors, Disagreements, User, Utility, ApiData, FocusUtility, CurrentUser, ChangeDetection } from "@/lib/types";


const initialStateApiData = {
  "current_user": {} as User,
  "users": [] as User[],
  "colors": {} as Colors,
  "utilities": [] as Utility[],
  "allocations": [] as Allocation[],
  "disagreements": {} as Disagreements,
} as ApiData;


const apiDataSlice = createSlice({
  name: "apiData",
  initialState: initialStateApiData,
  reducers: {
    setApiData: (state, action: PayloadAction<ApiData>) => action.payload,
    resetApiData: () => initialStateApiData,
  },

})


// Current User Slice
const currentUserSlice = createSlice({
  name: "currentUser",
  initialState: {} as CurrentUser,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<CurrentUser>) => action.payload,
    resetCurrentUser: () => { return {} as CurrentUser; },
    updateViewUser: (state, action: PayloadAction<User>) => {
      state.viewUser = action.payload
    },
  },
});

// Users Slice
const usersSlice = createSlice({
  name: "users",
  initialState: [] as User[],
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => action.payload,
    updateUser: (state, action: PayloadAction<{ username: string; updates: Partial<User> }>) => {
      const { username, updates } = action.payload;
      const user = state.find((u) => u.username === username);
      if (user) Object.assign(user, updates);
    },
    resetUsers: () => { return [] as User[]; }
  },
});

// Colors Slice
const colorsSlice = createSlice({
  name: "colors",
  initialState: {} as Colors,
  reducers: {
    setColors: (state, action: PayloadAction<Colors>) => action.payload,
    resetColors: () => { return {} as Colors; }
  },
});

// Utilities Slice
const utilitiesSlice = createSlice({
  name: "utilities",
  initialState: [] as Utility[],
  reducers: {
    setUtilities: (state, action: PayloadAction<Utility[]>) => action.payload,
    resetUtilities: () => { return [] as Utility[]; }
  },
});

// Dynamic Utilities Slice
const dynamicUtilitiesSlice = createSlice({
  name: "dynamicUtilities",
  initialState: [] as Utility[],
  reducers: {
    setDynamicUtilities: (state, action: PayloadAction<Utility[]>) => action.payload,
    resetDynamicUtilities: () => { return [] as Utility[]; }
  },
});

// Allocations Slice
const allocationsSlice = createSlice({
  name: "allocations",
  initialState: [] as Allocation[],
  reducers: {
    setAllocations: (state, action: PayloadAction<Allocation[]>) => {
      return action.payload;
    },
    resetAllocations: () => { return [] as Allocation[]; }
  },
});

// Disagreements Slice
const disagreementsSlice = createSlice({
  name: "disagreements",
  initialState: {} as Disagreements,
  reducers: {
    setDisagreements: (state, action: PayloadAction<Disagreements>) => action.payload,
    resetDisagreements: () => { return {} as Disagreements; }
  },
});

// Focus utility Slice
const focusUtilitySlice = createSlice({
  name: "focusUtility",
  initialState: {
    "activeUtility": "",
    "hoveredUtility": "",
  } as FocusUtility,
  reducers: {
    setFocusUtility: (state, action: PayloadAction<FocusUtility>) => action.payload,
    resetFocusUtility: () => {
      return {
        "activeUtility": "",
        "hoveredUtility": "",
      } as FocusUtility;
    },
    setActiveUtility: (state, action: PayloadAction<string>) => {
      state.activeUtility = action.payload;
    },
    setHoveredUtility: (state, action: PayloadAction<string>) => {
      state.hoveredUtility = action.payload;
    },
  },
});

// Changes utility Slice
const changeSlice = createSlice({
  name: "focusUtility",
  initialState: {
    "isUtilityChanged": false,
    "isBudgetChanged": -1,
  } as ChangeDetection,
  reducers: {
    setChangeDetection: (state, action: PayloadAction<ChangeDetection>) => action.payload,
    resetChangeDetection: () => {
      return {
        "isUtilityChanged": false,
        "isBudgetChanged": -1,
      } as ChangeDetection;
    },
    setUtilityChange: (state, action: PayloadAction<boolean>) => {
      state.isUtilityChanged = action.payload;
    },
    setBudgetChange: (state, action: PayloadAction<number>) => {
      state.isBudgetChanged = action.payload;
    },
  },
});

const logout = () => (dispatch: AppDispatch) => {
  dispatch(apiDataSlice.actions.resetApiData());
  dispatch(currentUserSlice.actions.resetCurrentUser());
  dispatch(usersSlice.actions.resetUsers());
  dispatch(colorsSlice.actions.resetColors());
  dispatch(utilitiesSlice.actions.resetUtilities());
  dispatch(dynamicUtilitiesSlice.actions.resetDynamicUtilities());
  dispatch(allocationsSlice.actions.resetAllocations());
  dispatch(disagreementsSlice.actions.resetDisagreements());
  dispatch(focusUtilitySlice.actions.resetFocusUtility());
  dispatch(changeSlice.actions.resetChangeDetection());
};

// Configure Storee
const store = configureStore({
  reducer: {
    apiData: apiDataSlice.reducer,
    currentUser: currentUserSlice.reducer,
    users: usersSlice.reducer,
    colors: colorsSlice.reducer,
    utilities: utilitiesSlice.reducer,
    dynamicUtilities: dynamicUtilitiesSlice.reducer,
    allocations: allocationsSlice.reducer,
    disagreements: disagreementsSlice.reducer,
    focusUtility: focusUtilitySlice.reducer,
    changeDetection: changeSlice.reducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const { setApiData, resetApiData } = apiDataSlice.actions;
export const { setCurrentUser, resetCurrentUser, updateViewUser } = currentUserSlice.actions;
export const { setUsers, updateUser, resetUsers } = usersSlice.actions;
export const { setColors, resetColors } = colorsSlice.actions;
export const { setUtilities, resetUtilities } = utilitiesSlice.actions;
export const { setDynamicUtilities, resetDynamicUtilities } = dynamicUtilitiesSlice.actions;
export const { setAllocations, resetAllocations } = allocationsSlice.actions;
export const { setDisagreements, resetDisagreements } = disagreementsSlice.actions;
export const { setFocusUtility, resetFocusUtility, setActiveUtility, setHoveredUtility } = focusUtilitySlice.actions;
export const { setChangeDetection, resetChangeDetection, setUtilityChange, setBudgetChange } = changeSlice.actions;
export { logout };
export default store;
