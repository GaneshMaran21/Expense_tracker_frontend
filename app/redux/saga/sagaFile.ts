// app/features/user/userSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import { fetchUserRequest, fetchUserSuccess, fetchUserFailure } from "../slice/userSlice";
import { getUser, userSignIn, userSignUp, createExpense, getExpenses, getExpense, updateExpense, deleteExpense } from "../network/network";

function* fetchUserWorker(action:any): Generator<any, void, any>  {
    console.log("saga works fine")
//   try {
//     const response = yield call(getUser, action.payload.id);
//     yield put(fetchUserSuccess(response.data));
//   } catch (error: any) {
//     yield put(fetchUserFailure(error.message));
//   }
};

function* userSignin(payload:any):Generator<any, void,any>{
    const callback = payload?.payload?.callback
    try{
        const { user_name, password } = payload?.payload;
        const response = yield call (userSignIn, { user_name, password })
        console.log(response,"signin response")
        if(response?.data){
            callback.success(response.data)
        }
        else{
            callback.failure({ message: "Invalid response from server" })
        }
    }
    catch(E:any){
        console.log(E,"signin error")
        const errorMessage = E?.data?.message || E?.message || "Login failed. Please try again."
        callback.failure({ message: errorMessage })
    }
}

function* userSignup(payload:any):Generator<any, void,any>{
    const callback = payload?.payload?.callback
    if(!callback || !callback.success || !callback.failure){
        console.error("Signup callback is missing or invalid")
        return
    }
    
    try{
        const { user_name, email, password, date_of_birth } = payload?.payload;
        
        // Validate required fields
        if(!user_name || !email || !password || !date_of_birth){
            callback.failure({ message: "All fields are required" })
            return
        }
        
        const response = yield call (userSignUp, { user_name, email, password, date_of_birth })
        console.log(response,"signup response")
        
        if(response?.data){
            callback.success(response.data)
        }
        else{
            callback.failure({ message: "Invalid response from server" })
        }
    }
    catch(E:any){
        console.log(E,"signup error")
        // Backend returns error in E?.data?.error for BadRequestException
        // Check error field first, then message, then fallback
        const errorMessage = E?.data?.error || E?.data?.message || E?.message || "Signup failed. Please try again."
        if(callback && callback.failure){
            callback.failure({ message: errorMessage })
        }
    }
}

export  function* userSaga() {
  yield takeLatest('fetchUser', fetchUserWorker);
};
export  function* userSignInSaga() {
  yield takeLatest('signin', userSignin);
}
export  function* userSignUpSaga() {
  yield takeLatest('signup', userSignup);
}

// Expense Sagas
function* createExpenseSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback
  if (!callback || !callback.success || !callback.failure) {
    console.error("Create expense callback is missing or invalid")
    return
  }
  
  try {
    const expenseData = payload?.payload?.data
    if (!expenseData || !expenseData.amount || !expenseData.category_id) {
      callback.failure({ message: "Amount and category are required" })
      return
    }
    
    const response = yield call(createExpense, expenseData)
    if (response?.data) {
      callback.success(response.data)
    } else {
      callback.failure({ message: "Invalid response from server" })
    }
  } catch (E: any) {
    console.log(E, "create expense error")
    // Don't auto-redirect in saga - let component handle alert and redirect
    // Just pass the error to the callback so component can show alert
    const errorMessage = E?.data?.error || E?.data?.message || E?.message || "Failed to create expense. Please try again."
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage })
    }
  }
}

function* getExpensesSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback
  if (!callback || !callback.success || !callback.failure) {
    console.error("Get expenses callback is missing or invalid")
    return
  }
  
  try {
    const filters = payload?.payload?.filters || {}
    const response = yield call(getExpenses, filters)
    if (response?.data) {
      callback.success(response.data)
    } else {
      callback.failure({ message: "Invalid response from server" })
    }
  } catch (E: any) {
    console.log(E, "get expenses error")
    // Don't auto-redirect in saga - let component handle alert and redirect
    // Just pass the error to the callback so component can show alert
    const errorMessage = E?.data?.error || E?.data?.message || E?.message || "Failed to fetch expenses. Please try again."
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage })
    }
  }
}

function* getExpenseSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback
  if (!callback || !callback.success || !callback.failure) {
    console.error("Get expense callback is missing or invalid")
    return
  }
  
  try {
    const id = payload?.payload?.id
    if (!id) {
      callback.failure({ message: "Expense ID is required" })
      return
    }
    
    const response = yield call(getExpense, id)
    if (response?.data) {
      callback.success(response.data)
    } else {
      callback.failure({ message: "Invalid response from server" })
    }
  } catch (E: any) {
    console.log(E, "get expense error")
    // Don't auto-redirect in saga - let component handle alert and redirect
    // Just pass the error to the callback so component can show alert
    const errorMessage = E?.data?.error || E?.data?.message || E?.message || "Failed to fetch expense. Please try again."
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage })
    }
  }
}

function* updateExpenseSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback
  if (!callback || !callback.success || !callback.failure) {
    console.error("Update expense callback is missing or invalid")
    return
  }
  
  try {
    const { id, data } = payload?.payload
    if (!id) {
      callback.failure({ message: "Expense ID is required" })
      return
    }
    
    const response = yield call(updateExpense, id, data)
    if (response?.data) {
      callback.success(response.data)
    } else {
      callback.failure({ message: "Invalid response from server" })
    }
  } catch (E: any) {
    console.log(E, "update expense error")
    // Don't auto-redirect in saga - let component handle alert and redirect
    // Just pass the error to the callback so component can show alert
    const errorMessage = E?.data?.error || E?.data?.message || E?.message || "Failed to update expense. Please try again."
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage })
    }
  }
}

function* deleteExpenseSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback
  if (!callback || !callback.success || !callback.failure) {
    console.error("Delete expense callback is missing or invalid")
    return
  }
  
  try {
    const id = payload?.payload?.id
    if (!id) {
      callback.failure({ message: "Expense ID is required" })
      return
    }
    
    const response = yield call(deleteExpense, id)
    if (response?.data || response?.status === 200) {
      callback.success({ id })
    } else {
      callback.failure({ message: "Invalid response from server" })
    }
  } catch (E: any) {
    console.log(E, "delete expense error")
    // Don't auto-redirect in saga - let component handle alert and redirect
    // Just pass the error to the callback so component can show alert
    const errorMessage = E?.data?.error || E?.data?.message || E?.message || "Failed to delete expense. Please try again."
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage })
    }
  }
}

export function* createExpenseSagaWatcher() {
  yield takeLatest('createExpense', createExpenseSaga)
}

export function* getExpensesSagaWatcher() {
  yield takeLatest('getExpenses', getExpensesSaga)
}

export function* getExpenseSagaWatcher() {
  yield takeLatest('getExpense', getExpenseSaga)
}

export function* updateExpenseSagaWatcher() {
  yield takeLatest('updateExpense', updateExpenseSaga)
}

export function* deleteExpenseSagaWatcher() {
  yield takeLatest('deleteExpense', deleteExpenseSaga)
}
