// app/store/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from '../slice/userSlice'

const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;