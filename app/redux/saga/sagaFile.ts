// app/features/user/userSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import { fetchUserRequest, fetchUserSuccess, fetchUserFailure } from "../slice/userSlice";
import { getUser, userSignIn } from "../network/network";

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
    debugger
    const callback = payload?.payload?.callback
    try{

        const response = yield call (userSignIn,payload?.payload)
        console.log(response,"responser")
        if(response){
            callback.success()
        }
        else{

        }
    }
    catch(E:any){
        console.log(E,"errorr")
        callback.failure(E?.data)
    }
}

export  function* userSaga() {
  yield takeLatest('fetchUser', fetchUserWorker);
};
export  function* userSignInSaga() {
  yield takeLatest('signin', userSignin);
}
