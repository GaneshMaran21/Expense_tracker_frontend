// app/network/endpoints.ts
export const endpoints = {
//   getUser: (id: string) => `/users/${id}`,
  getUser:'/user',
  sigin:'/signin',
  signup:'/signUp',
  expenses: '/expenses',
  expense: (id: string) => `/expenses/${id}`,
  budgets: '/budgets',
  budget: (id: string) => `/budgets/${id}`,
  budgetStatus: (id: string) => `/budgets/${id}/status`,
  budgetsWithStatus: '/budgets/with-status',
};