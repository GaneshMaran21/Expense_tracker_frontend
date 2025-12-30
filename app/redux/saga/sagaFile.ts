// app/features/user/userSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import { fetchUserRequest, fetchUserSuccess, fetchUserFailure } from "../slice/userSlice";
import { getUser, userSignIn, userSignUp, createExpense, getExpenses, getExpense, updateExpense, deleteExpense, createBudget, getBudgets, getBudgetsWithStatus, getBudget, getBudgetStatus, updateBudget, deleteBudget, getNotifications, getNotificationUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllReadNotifications } from "../network/network";
import { getNotificationsRequest, getNotificationsSuccess, getNotificationsFailure, getUnreadCountRequest, getUnreadCountSuccess, getUnreadCountFailure, markAsReadRequest, markAsReadSuccess, markAsReadFailure, markAllAsReadRequest, markAllAsReadSuccess, markAllAsReadFailure, deleteNotificationRequest, deleteNotificationSuccess, deleteNotificationFailure } from "../slice/notificationSlice";

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
    if(!callback || !callback.success || !callback.failure){
        console.error("❌ [Saga] Signin callback is missing or invalid")
        return
    }
    
    try{
        const { user_name, password } = payload?.payload;
        console.log("🔍 [Saga] Attempting signin for user:", user_name)
        const response = yield call (userSignIn, { user_name, password })
        console.log("✅ [Saga] Signin response received:", {
            hasData: !!response?.data,
            hasAccessToken: !!response?.data?.accessToken,
            status: response?.status
        })
        
        if(response?.data){
            callback.success(response.data)
        }
        else{
            console.error("❌ [Saga] Signin response has no data:", response)
            callback.failure({ message: "Invalid response from server" })
        }
    }
    catch(E:any){
        console.error("❌ [Saga] Signin error:", {
            error: E,
            message: E?.message,
            status: E?.status,
            code: E?.code,
            data: E?.data,
            response: E?.response?.status,
            responseData: E?.response?.data
        })
        
        // Extract detailed error message
        let errorMessage = "Login failed. Please try again."
        
        // Check for network errors first
        if (E?.code === 'ECONNABORTED' || E?.message?.includes('timeout')) {
            errorMessage = 'Request timed out. Please check:\n1. Backend server is running\n2. Internet connection is stable\n3. Server URL is correct'
        } else if (E?.code === 'ERR_NETWORK' || E?.message?.includes('Network Error')) {
            errorMessage = 'Network error. Please check:\n1. Your internet connection\n2. Backend server is running on http://43.204.140.81:2222\n3. Device can reach the backend server'
        } else if (E?.response?.status === 401) {
            errorMessage = E?.response?.data?.message || 'Invalid username or password'
        } else if (E?.response?.status === 404) {
            errorMessage = 'Server endpoint not found. Please check backend configuration.'
        } else if (E?.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.'
        } else if (E?.data?.error) {
            errorMessage = E.data.error
        } else if (E?.data?.message) {
            errorMessage = E.data.message
        } else if (E?.message) {
            errorMessage = E.message
        }
        
        callback.failure({ 
            ...E, 
            message: errorMessage,
            status: E?.status || E?.response?.status,
            code: E?.code
        })
    }
}

function* userSignup(payload:any):Generator<any, void,any>{
    const callback = payload?.payload?.callback
    if(!callback || !callback.success || !callback.failure){
        console.error("❌ [Saga] Signup callback is missing or invalid")
        return
    }
    
    try{
        const { user_name, email, password, date_of_birth } = payload?.payload;
        
        // Validate required fields
        if(!user_name || !email || !password || !date_of_birth){
            callback.failure({ message: "All fields are required" })
            return
        }
        
        console.log("🔍 [Saga] Attempting signup for user:", user_name, "email:", email)
        const response = yield call (userSignUp, { user_name, email, password, date_of_birth })
        console.log("✅ [Saga] Signup response received:", {
            hasData: !!response?.data,
            hasAccessToken: !!response?.data?.accessToken,
            status: response?.status
        })
        
        if(response?.data){
            callback.success(response.data)
        }
        else{
            console.error("❌ [Saga] Signup response has no data:", response)
            callback.failure({ message: "Invalid response from server" })
        }
    }
    catch(E:any){
        console.error("❌ [Saga] Signup error:", {
            error: E,
            message: E?.message,
            status: E?.status,
            code: E?.code,
            data: E?.data,
            response: E?.response?.status,
            responseData: E?.response?.data
        })
        
        // Extract detailed error message
        let errorMessage = "Signup failed. Please try again."
        
        // Check for network errors first
        if (E?.code === 'ECONNABORTED' || E?.message?.includes('timeout')) {
            errorMessage = 'Request timed out. Please check:\n1. Backend server is running\n2. Internet connection is stable\n3. Server URL is correct'
        } else if (E?.code === 'ERR_NETWORK' || E?.message?.includes('Network Error')) {
            errorMessage = 'Network error. Please check:\n1. Your internet connection\n2. Backend server is running on http://43.204.140.81:2222\n3. Device can reach the backend server'
        } else if (E?.response?.status === 400) {
            errorMessage = E?.response?.data?.error || E?.response?.data?.message || 'Invalid signup data. Please check your input.'
        } else if (E?.response?.status === 409) {
            errorMessage = 'User already exists. Please login instead.'
        } else if (E?.response?.status === 404) {
            errorMessage = 'Server endpoint not found. Please check backend configuration.'
        } else if (E?.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.'
        } else if (E?.data?.error) {
            errorMessage = E.data.error
        } else if (E?.data?.message) {
            errorMessage = E.data.message
        } else if (E?.message) {
            errorMessage = E.message
        }
        
        if(callback && callback.failure){
            callback.failure({ 
                ...E, 
                message: errorMessage,
                status: E?.status || E?.response?.status,
                code: E?.code
            })
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
    console.error("❌ Get expenses callback is missing or invalid")
    return
  }
  
  try {
    const filters = payload?.payload?.filters || {}
    console.log("🔍 [Saga] Fetching expenses with filters:", JSON.stringify(filters, null, 2))
    
    const response = yield call(getExpenses, filters)
    console.log("✅ [Saga] API Response received:", {
      hasResponse: !!response,
      hasData: !!response?.data,
      dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
      dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A',
      status: response?.status,
      statusText: response?.statusText
    })
    
    if (response?.data) {
      console.log("✅ [Saga] Calling success callback with data:", {
        count: Array.isArray(response.data) ? response.data.length : 1,
        sample: Array.isArray(response.data) ? response.data[0] : response.data,
        callbackType: typeof callback.success,
        callbackExists: !!callback.success
      })
      
      // Verify data is array before calling callback
      if (!Array.isArray(response.data)) {
        console.error("❌ [Saga] Response data is not an array!", {
          type: typeof response.data,
          data: response.data
        })
      }
      
      try {
        callback.success(response.data)
        console.log("✅ [Saga] Success callback executed")
      } catch (callbackError) {
        console.error("❌ [Saga] Error executing success callback:", callbackError)
      }
    } else {
      console.error("❌ [Saga] Response has no data:", response)
      callback.failure({ message: "Invalid response from server" })
    }
  } catch (E: any) {
    console.error("❌ [Saga] get expenses error:", {
      error: E,
      message: E?.message,
      status: E?.status,
      data: E?.data,
      code: E?.code
    })
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

// Budget Sagas
function* createBudgetSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback;
  const callbackId = payload?.payload?.callbackId || 'N/A';
  console.log(`🔍 [Saga] Create budget request with callback ID: ${callbackId}`, payload?.payload);
  if (!callback || !callback.success || !callback.failure) {
    console.error(`❌ [Saga] Create budget callback is missing or invalid for ID ${callbackId}`);
    return;
  }

  try {
    const response = yield call(createBudget, payload?.payload?.budgetData);
    console.log(`✅ [Saga] Create budget API response received for ID ${callbackId}:`, response);
    if (response?.data) {
      console.log(`✅ [Saga] Calling success callback for ID ${callbackId}`);
      if (callback?.success) {
        callback.success(response.data);
        console.log(`✅ [Saga] Success callback executed for ID ${callbackId}`);
      }
    } else {
      console.warn(`⚠️ [Saga] Invalid response from server for create budget ID ${callbackId}`);
      if (callback?.failure) {
        callback.failure({ message: "Invalid response from server" });
        console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
      }
    }
  } catch (E: any) {
    console.error(`❌ [Saga] Create budget error for ID ${callbackId}:`, E);
    const errorMessage = E?.data?.message || E?.message || "Failed to create budget. Please try again.";
    if (callback?.failure) {
      callback.failure({ ...E, message: errorMessage });
      console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
    }
  }
}

function* getBudgetsSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback;
  const callbackId = payload?.payload?.callbackId || 'N/A';
  console.log(`🔍 [Saga] Get budgets request with callback ID: ${callbackId}`, payload?.payload);
  if (!callback || !callback.success || !callback.failure) {
    console.error(`❌ [Saga] Get budgets callback is missing or invalid for ID ${callbackId}`);
    return;
  }

  try {
    const filters = payload?.payload?.filters || {};
    const response = yield call(getBudgets, filters);
    console.log(`✅ [Saga] Get budgets API response received for ID ${callbackId}:`, response);
    if (response?.data) {
      if (callback?.success) {
        callback.success(response.data);
        console.log(`✅ [Saga] Success callback executed for ID ${callbackId}`);
      }
    } else {
      console.warn(`⚠️ [Saga] Invalid response from server for get budgets ID ${callbackId}`);
      if (callback?.failure) {
        callback.failure({ message: "Invalid response from server" });
        console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
      }
    }
  } catch (E: any) {
    console.error(`❌ [Saga] Get budgets error for ID ${callbackId}:`, E);
    const errorMessage = E?.data?.error || E?.data?.message || E?.message || "Failed to fetch budgets. Please try again.";
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage });
      console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
    }
  }
}

function* getBudgetsWithStatusSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback;
  const callbackId = payload?.payload?.callbackId || 'N/A';
  console.log(`🔍 [Saga] Get budgets with status request with callback ID: ${callbackId}`, payload?.payload);
  if (!callback || !callback.success || !callback.failure) {
    console.error(`❌ [Saga] Get budgets with status callback is missing or invalid for ID ${callbackId}`);
    return;
  }

  try {
    const filters = payload?.payload?.filters || {};
    const response = yield call(getBudgetsWithStatus, filters);
    console.log(`✅ [Saga] Get budgets with status API response received for ID ${callbackId}:`, response);
    if (response?.data) {
      if (callback?.success) {
        callback.success(response.data);
        console.log(`✅ [Saga] Success callback executed for ID ${callbackId}`);
      }
    } else {
      console.warn(`⚠️ [Saga] Invalid response from server for get budgets with status ID ${callbackId}`);
      if (callback?.failure) {
        callback.failure({ message: "Invalid response from server" });
        console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
      }
    }
  } catch (E: any) {
    console.error(`❌ [Saga] Get budgets with status error for ID ${callbackId}:`, E);
    const errorMessage = E?.data?.error || E?.data?.message || E?.message || "Failed to fetch budgets. Please try again.";
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage });
      console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
    }
  }
}

function* getBudgetSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback;
  const callbackId = payload?.payload?.callbackId || 'N/A';
  console.log(`🔍 [Saga] Get single budget request with callback ID: ${callbackId}`, payload?.payload);
  if (!callback || !callback.success || !callback.failure) {
    console.error(`❌ [Saga] Get single budget callback is missing or invalid for ID ${callbackId}`);
    return;
  }

  try {
    const id = payload?.payload?.id;
    if (!id) {
      console.warn(`⚠️ [Saga] Missing budget ID for get single budget ID ${callbackId}`);
      callback.failure({ message: "Budget ID is required" });
      return;
    }
    const response = yield call(getBudget, id);
    console.log(`✅ [Saga] Get single budget API response received for ID ${callbackId}:`, response);
    if (response?.data) {
      if (callback?.success) {
        callback.success(response.data);
        console.log(`✅ [Saga] Success callback executed for ID ${callbackId}`);
      }
    } else {
      console.warn(`⚠️ [Saga] Invalid response from server for get single budget ID ${callbackId}`);
      if (callback?.failure) {
        callback.failure({ message: "Invalid response from server" });
        console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
      }
    }
  } catch (E: any) {
    console.error(`❌ [Saga] Get single budget error for ID ${callbackId}:`, E);
    const errorMessage = E?.data?.message || E?.message || "Failed to fetch budget. Please try again.";
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage });
      console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
    }
  }
}

function* getBudgetStatusSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback;
  const callbackId = payload?.payload?.callbackId || 'N/A';
  console.log(`🔍 [Saga] Get budget status request with callback ID: ${callbackId}`, payload?.payload);
  if (!callback || !callback.success || !callback.failure) {
    console.error(`❌ [Saga] Get budget status callback is missing or invalid for ID ${callbackId}`);
    return;
  }

  try {
    const id = payload?.payload?.id;
    if (!id) {
      console.warn(`⚠️ [Saga] Missing budget ID for get budget status ID ${callbackId}`);
      callback.failure({ message: "Budget ID is required" });
      return;
    }
    const response = yield call(getBudgetStatus, id);
    console.log(`✅ [Saga] Get budget status API response received for ID ${callbackId}:`, response);
    if (response?.data) {
      if (callback?.success) {
        callback.success(response.data);
        console.log(`✅ [Saga] Success callback executed for ID ${callbackId}`);
      }
    } else {
      console.warn(`⚠️ [Saga] Invalid response from server for get budget status ID ${callbackId}`);
      if (callback?.failure) {
        callback.failure({ message: "Invalid response from server" });
        console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
      }
    }
  } catch (E: any) {
    console.error(`❌ [Saga] Get budget status error for ID ${callbackId}:`, E);
    const errorMessage = E?.data?.message || E?.message || "Failed to fetch budget status. Please try again.";
    if (callback && callback.failure) {
      callback.failure({ ...E, message: errorMessage });
      console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
    }
  }
}

function* updateBudgetSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback;
  const callbackId = payload?.payload?.callbackId || 'N/A';
  console.log(`🔍 [Saga] Update budget request with callback ID: ${callbackId}`, payload?.payload);
  if (!callback || !callback.success || !callback.failure) {
    console.error(`❌ [Saga] Update budget callback is missing or invalid for ID ${callbackId}`);
    return;
  }

  try {
    const { id, budgetData } = payload?.payload;
    if (!id || !budgetData) {
      console.warn(`⚠️ [Saga] Missing ID or data for update budget ID ${callbackId}`);
      callback.failure({ message: "Budget ID and data are required" });
      return;
    }
    const response = yield call(updateBudget, id, budgetData);
    console.log(`✅ [Saga] Update budget API response received for ID ${callbackId}:`, response);
    if (response?.data) {
      if (callback?.success) {
        callback.success(response.data);
        console.log(`✅ [Saga] Success callback executed for ID ${callbackId}`);
      }
    } else {
      console.warn(`⚠️ [Saga] Invalid response from server for update budget ID ${callbackId}`);
      if (callback?.failure) {
        callback.failure({ message: "Invalid response from server" });
        console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
      }
    }
  } catch (E: any) {
    console.error(`❌ [Saga] Update budget error for ID ${callbackId}:`, E);
    const errorMessage = E?.data?.message || E?.message || "Failed to update budget. Please try again.";
    if (callback?.failure) {
      callback.failure({ ...E, message: errorMessage });
      console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
    }
  }
}

function* deleteBudgetSaga(payload: any): Generator<any, void, any> {
  const callback = payload?.payload?.callback;
  const callbackId = payload?.payload?.callbackId || 'N/A';
  console.log(`🔍 [Saga] Delete budget request with callback ID: ${callbackId}`, payload?.payload);
  if (!callback || !callback.success || !callback.failure) {
    console.error(`❌ [Saga] Delete budget callback is missing or invalid for ID ${callbackId}`);
    return;
  }

  try {
    const id = payload?.payload?.id;
    if (!id) {
      console.warn(`⚠️ [Saga] Missing budget ID for delete budget ID ${callbackId}`);
      callback.failure({ message: "Budget ID is required" });
      return;
    }
    const response = yield call(deleteBudget, id);
    console.log(`✅ [Saga] Delete budget API response received for ID ${callbackId}:`, response);
    if (response?.data !== undefined) {
      if (callback?.success) {
        callback.success(response.data || { success: true });
        console.log(`✅ [Saga] Success callback executed for ID ${callbackId}`);
      }
    } else {
      console.warn(`⚠️ [Saga] Invalid response from server for delete budget ID ${callbackId}`);
      if (callback?.failure) {
        callback.failure({ message: "Invalid response from server" });
        console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
      }
    }
  } catch (E: any) {
    console.error(`❌ [Saga] Delete budget error for ID ${callbackId}:`, E);
    const errorMessage = E?.data?.message || E?.message || "Failed to delete budget. Please try again.";
    if (callback?.failure) {
      callback.failure({ ...E, message: errorMessage });
      console.log(`❌ [Saga] Failure callback executed for ID ${callbackId}`);
    }
  }
}

export function* createBudgetSagaWatcher() {
  yield takeLatest('createBudget', createBudgetSaga);
}

export function* getBudgetsSagaWatcher() {
  yield takeLatest('getBudgets', getBudgetsSaga);
}

export function* getBudgetsWithStatusSagaWatcher() {
  yield takeLatest('getBudgetsWithStatus', getBudgetsWithStatusSaga);
}

export function* getBudgetSagaWatcher() {
  yield takeLatest('getBudget', getBudgetSaga);
}

export function* getBudgetStatusSagaWatcher() {
  yield takeLatest('getBudgetStatus', getBudgetStatusSaga);
}

export function* updateBudgetSagaWatcher() {
  yield takeLatest('updateBudget', updateBudgetSaga);
}

export function* deleteBudgetSagaWatcher() {
  yield takeLatest('deleteBudget', deleteBudgetSaga);
}

// Notification Sagas
function* getNotificationsSaga(action: any): Generator<any, void, any> {
  try {
    yield put(getNotificationsRequest(action.payload));
    const filters = action.payload?.filters || {};
    const response = yield call(getNotifications, filters);
    if (response?.data) {
      yield put(getNotificationsSuccess(response.data));
    } else {
      yield put(getNotificationsFailure("Invalid response from server"));
    }
  } catch (error: any) {
    const errorMessage = error?.data?.message || error?.message || "Failed to fetch notifications";
    yield put(getNotificationsFailure(errorMessage));
  }
}

function* getUnreadCountSaga(): Generator<any, void, any> {
  try {
    yield put(getUnreadCountRequest());
    const response = yield call(getNotificationUnreadCount);
    if (response?.data !== undefined) {
      yield put(getUnreadCountSuccess(response.data));
    } else {
      yield put(getUnreadCountFailure("Invalid response from server"));
    }
  } catch (error: any) {
    const errorMessage = error?.data?.message || error?.message || "Failed to fetch unread count";
    yield put(getUnreadCountFailure(errorMessage));
  }
}

function* markAsReadSaga(action: any): Generator<any, void, any> {
  try {
    const id = action.payload?.id;
    if (!id) {
      yield put(markAsReadFailure("Notification ID is required"));
      return;
    }
    yield put(markAsReadRequest(id));
    const response = yield call(markNotificationAsRead, id);
    if (response?.data) {
      yield put(markAsReadSuccess(response.data));
    } else {
      yield put(markAsReadFailure("Invalid response from server"));
    }
  } catch (error: any) {
    const errorMessage = error?.data?.message || error?.message || "Failed to mark notification as read";
    yield put(markAsReadFailure(errorMessage));
  }
}

function* markAllAsReadSaga(): Generator<any, void, any> {
  try {
    yield put(markAllAsReadRequest());
    const response = yield call(markAllNotificationsAsRead);
    if (response?.data !== undefined) {
      yield put(markAllAsReadSuccess());
    } else {
      yield put(markAllAsReadFailure("Invalid response from server"));
    }
  } catch (error: any) {
    const errorMessage = error?.data?.message || error?.message || "Failed to mark all notifications as read";
    yield put(markAllAsReadFailure(errorMessage));
  }
}

function* deleteNotificationSaga(action: any): Generator<any, void, any> {
  try {
    const id = action.payload?.id;
    if (!id) {
      yield put(deleteNotificationFailure("Notification ID is required"));
      return;
    }
    yield put(deleteNotificationRequest(id));
    const response = yield call(deleteNotification, id);
    if (response?.data !== undefined) {
      yield put(deleteNotificationSuccess());
    } else {
      yield put(deleteNotificationFailure("Invalid response from server"));
    }
  } catch (error: any) {
    const errorMessage = error?.data?.message || error?.message || "Failed to delete notification";
    yield put(deleteNotificationFailure(errorMessage));
  }
}

export function* getNotificationsSagaWatcher() {
  yield takeLatest('getNotifications', getNotificationsSaga);
}

export function* getUnreadCountSagaWatcher() {
  yield takeLatest('getUnreadCount', getUnreadCountSaga);
}

export function* markAsReadSagaWatcher() {
  yield takeLatest('markAsRead', markAsReadSaga);
}

export function* markAllAsReadSagaWatcher() {
  yield takeLatest('markAllAsRead', markAllAsReadSaga);
}

export function* deleteNotificationSagaWatcher() {
  yield takeLatest('deleteNotification', deleteNotificationSaga);
}
