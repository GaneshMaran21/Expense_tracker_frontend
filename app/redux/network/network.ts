// app/features/user/userApi.ts
import apiClient from "../network/apiClient";
import { endpoints } from "../endpoint/endpoint";

export const getUser = async(id: string) => {
  return await apiClient.get(`${endpoints.getUser}/${id}`);
};

export const userSignIn =async (payload:any) =>{
    const response =  await apiClient.post(endpoints.sigin,payload)
    return response
}

export const userSignUp = async (payload:any) => {
    const response = await apiClient.post(endpoints.signup, payload)
    return response
}

// Expense API calls
export const createExpense = async (payload: any) => {
  const response = await apiClient.post(endpoints.expenses, payload)
  return response
}

export const getExpenses = async (filters?: any) => {
  const response = await apiClient.get(endpoints.expenses, { params: filters })
  return response
}

export const getExpense = async (id: string) => {
  const response = await apiClient.get(endpoints.expense(id))
  return response
}

export const updateExpense = async (id: string, payload: any) => {
  const response = await apiClient.patch(endpoints.expense(id), payload)
  return response
}

export const deleteExpense = async (id: string) => {
  const response = await apiClient.delete(endpoints.expense(id))
  return response
}