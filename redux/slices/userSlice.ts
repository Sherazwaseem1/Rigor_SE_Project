import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: number;  
  name: string;
  email: string;
  isAdmin: boolean;
}

const initialState: UserState = {
  id: 0,
  name: "",
  email: "",
  isAdmin: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.isAdmin = action.payload.isAdmin;
    },
    resetUser: (state) => {
      state.id = 0; 
      state.name = "";
      state.email = "";
      state.isAdmin = false;
    },
  },
});

export const { setUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
