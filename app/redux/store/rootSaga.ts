// app/store/rootSaga.ts
import { all, fork } from "redux-saga/effects";
import {userSaga, userSignInSaga, userSignUpSaga, createExpenseSagaWatcher, getExpensesSagaWatcher, getExpenseSagaWatcher, updateExpenseSagaWatcher, deleteExpenseSagaWatcher, createBudgetSagaWatcher, getBudgetsSagaWatcher, getBudgetsWithStatusSagaWatcher, getBudgetSagaWatcher, getBudgetStatusSagaWatcher, updateBudgetSagaWatcher, deleteBudgetSagaWatcher} from "../saga/sagaFile";

export default function* rootSaga() {
  yield all([
    fork(userSaga),
    fork(userSignInSaga),
    fork(userSignUpSaga),
    fork(createExpenseSagaWatcher),
    fork(getExpensesSagaWatcher),
    fork(getExpenseSagaWatcher),
    fork(updateExpenseSagaWatcher),
    fork(deleteExpenseSagaWatcher),
    fork(createBudgetSagaWatcher),
    fork(getBudgetsSagaWatcher),
    fork(getBudgetsWithStatusSagaWatcher),
    fork(getBudgetSagaWatcher),
    fork(getBudgetStatusSagaWatcher),
    fork(updateBudgetSagaWatcher),
    fork(deleteBudgetSagaWatcher),
]);
}