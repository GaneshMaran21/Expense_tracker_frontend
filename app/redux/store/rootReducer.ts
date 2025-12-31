// app/store/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from '../slice/userSlice'
import notificationReducer from '../slice/notificationSlice'
import analyticsReducer from '../slice/analyticsSlice'

const rootReducer = combineReducers({
  user: userReducer,
  notification: notificationReducer,
  analytics: analyticsReducer,
});

export default rootReducer;