import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { Allocation, Colors, Disagreements, User, Utility } from "@/lib/types";

// Current User Slice
const currentUserSlice = createSlice({
  name: "currentUser",
  initialState: {} as User,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => action.payload,
    resetCurrentUser: () => { return {} as User; }
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

// Allocations Slice
const allocationsSlice = createSlice({
  name: "allocations",
  initialState: [] as Allocation[],
  reducers: {
    setAllocations: (state, action: PayloadAction<Allocation[]>) => action.payload,
    resetAllocations: () => { return [] as Allocation[]; }
  },
});

// Disagreements Slice
const disagreementsSlice = createSlice({
  name: "disagreements",
  initialState: [] as Disagreements[],
  reducers: {
    setDisagreements: (state, action: PayloadAction<Disagreements[]>) => action.payload,
    resetDisagreements: () => { return [] as Disagreements[]; }
  },
});

// Configure Store
const store = configureStore({
  reducer: {
    currentUser: currentUserSlice.reducer,
    users: usersSlice.reducer,
    colors: colorsSlice.reducer,
    utilities: utilitiesSlice.reducer,
    allocations: allocationsSlice.reducer,
    disagreements: disagreementsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const { setCurrentUser, resetCurrentUser } = currentUserSlice.actions;
export const { setUsers, updateUser, resetUsers } = usersSlice.actions;
export const { setColors, resetColors } = colorsSlice.actions;
export const { setUtilities, resetUtilities } = utilitiesSlice.actions;
export const { setAllocations, resetAllocations } = allocationsSlice.actions;
export const { setDisagreements, resetDisagreements } = disagreementsSlice.actions;

export default store;
