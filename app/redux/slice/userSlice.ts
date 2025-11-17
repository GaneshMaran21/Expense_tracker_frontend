// app/features/user/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  data: any;
  loading: boolean;
  error: string | null;
  userData:[]
}

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
  userData:[]
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUserRequest: (state, action: PayloadAction<{ id: string }>) => {
      state.loading = true;
    },
    fetchUserSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.data = action.payload;
    },
    fetchUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUserData:(state,action:PayloadAction<any>)=>{
      state.userData = action.payload
    }
  },
});

export const { fetchUserRequest, fetchUserSuccess, fetchUserFailure } = userSlice.actions;
export default userSlice.reducer;