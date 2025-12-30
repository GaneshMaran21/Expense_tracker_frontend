// app/store/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from '../slice/userSlice'
import notificationReducer from '../slice/notificationSlice'

const rootReducer = combineReducers({
  user: userReducer,
  notification: notificationReducer,
});

export default rootReducer;