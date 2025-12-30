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

// Budget API calls
export const createBudget = async (payload: any) => {
  const response = await apiClient.post(endpoints.budgets, payload)
  return response
}

export const getBudgets = async (filters?: { is_active?: boolean }) => {
  const params: any = {}
  if (filters?.is_active !== undefined) {
    params.is_active = filters.is_active.toString()
  }
  const response = await apiClient.get(endpoints.budgets, { params })
  return response
}

export const getBudgetsWithStatus = async (filters?: { is_active?: boolean }) => {
  const params: any = {}
  if (filters?.is_active !== undefined) {
    params.is_active = filters.is_active.toString()
  }
  const response = await apiClient.get(endpoints.budgetsWithStatus, { params })
  return response
}

export const getBudget = async (id: string) => {
  const response = await apiClient.get(endpoints.budget(id))
  return response
}

export const getBudgetStatus = async (id: string) => {
  const response = await apiClient.get(endpoints.budgetStatus(id))
  return response
}

export const updateBudget = async (id: string, payload: any) => {
  const response = await apiClient.patch(endpoints.budget(id), payload)
  return response
}

export const deleteBudget = async (id: string) => {
  const response = await apiClient.delete(endpoints.budget(id))
  return response
}

// Notification API calls
export const getNotifications = async (filters?: { is_read?: boolean; type?: string; limit?: number; skip?: number }) => {
  const params: any = {}
  if (filters?.is_read !== undefined) {
    params.is_read = filters.is_read.toString()
  }
  if (filters?.type) {
    params.type = filters.type
  }
  if (filters?.limit) {
    params.limit = filters.limit.toString()
  }
  if (filters?.skip) {
    params.skip = filters.skip.toString()
  }
  const response = await apiClient.get(endpoints.notifications, { params })
  return response
}

export const getNotificationUnreadCount = async () => {
  const response = await apiClient.get(endpoints.notificationUnreadCount)
  return response
}

export const getNotification = async (id: string) => {
  const response = await apiClient.get(endpoints.notification(id))
  return response
}

export const markNotificationAsRead = async (id: string) => {
  const response = await apiClient.patch(endpoints.markNotificationRead(id))
  return response
}

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.patch(endpoints.markAllNotificationsRead)
  return response
}

export const deleteNotification = async (id: string) => {
  const response = await apiClient.delete(endpoints.notification(id))
  return response
}

export const deleteAllReadNotifications = async () => {
  const response = await apiClient.delete(endpoints.deleteAllReadNotifications)
  return response
}

export const createTestNotification = async (payload?: { type?: string; title?: string; message?: string }) => {
  const response = await apiClient.post(endpoints.createTestNotification, payload || {})
  return response
}