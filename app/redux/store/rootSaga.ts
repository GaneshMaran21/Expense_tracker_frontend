// app/store/rootSaga.ts
import { all, fork } from "redux-saga/effects";
import {userSaga, userSignInSaga} from "../saga/sagaFile";

export default function* rootSaga() {
  yield all([
    fork(userSaga),
    fork(userSignInSaga),
]);
}