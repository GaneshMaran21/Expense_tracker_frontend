// app/redux/slice/analyticsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SpendingTrend {
  date: string;
  amount: number;
  count: number;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  total: number;
  count: number;
  percentage: number;
}

export interface PaymentMethodAnalysis {
  payment_method: string;
  total: number;
  count: number;
  percentage: number;
}

export interface SpendingForecast {
  period: string;
  projected: number;
  average: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AnalyticsSummary {
  trends: SpendingTrend[];
  categories: CategoryBreakdown[];
  paymentMethods: PaymentMethodAnalysis[];
  topCategories: CategoryBreakdown[];
  forecast: SpendingForecast;
}

interface AnalyticsState {
  trends: SpendingTrend[];
  categories: CategoryBreakdown[];
  paymentMethods: PaymentMethodAnalysis[];
  topCategories: CategoryBreakdown[];
  forecast: SpendingForecast | null;
  summary: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  trends: [],
  categories: [],
  paymentMethods: [],
  topCategories: [],
  forecast: null,
  summary: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    // Get trends
    getTrendsRequest: (state, action: PayloadAction<{ period?: 'week' | 'month' | 'year' }>) => {
      state.loading = true;
      state.error = null;
    },
    getTrendsSuccess: (state, action: PayloadAction<SpendingTrend[]>) => {
      state.loading = false;
      state.trends = action.payload;
    },
    getTrendsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get categories
    getCategoriesRequest: (state, action: PayloadAction<{ startDate?: string; endDate?: string }>) => {
      state.loading = true;
      state.error = null;
    },
    getCategoriesSuccess: (state, action: PayloadAction<CategoryBreakdown[]>) => {
      state.loading = false;
      state.categories = action.payload;
    },
    getCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get payment methods
    getPaymentMethodsRequest: (state, action: PayloadAction<{ startDate?: string; endDate?: string }>) => {
      state.loading = true;
      state.error = null;
    },
    getPaymentMethodsSuccess: (state, action: PayloadAction<PaymentMethodAnalysis[]>) => {
      state.loading = false;
      state.paymentMethods = action.payload;
    },
    getPaymentMethodsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get top categories
    getTopCategoriesRequest: (state, action: PayloadAction<{ limit?: number; startDate?: string; endDate?: string }>) => {
      state.loading = true;
      state.error = null;
    },
    getTopCategoriesSuccess: (state, action: PayloadAction<CategoryBreakdown[]>) => {
      state.loading = false;
      state.topCategories = action.payload;
    },
    getTopCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get forecast
    getForecastRequest: (state, action: PayloadAction<{ period?: 'week' | 'month' | 'year' }>) => {
      state.loading = true;
      state.error = null;
    },
    getForecastSuccess: (state, action: PayloadAction<SpendingForecast>) => {
      state.loading = false;
      state.forecast = action.payload;
    },
    getForecastFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get summary
    getSummaryRequest: (state, action: PayloadAction<{ startDate?: string; endDate?: string }>) => {
      state.loading = true;
      state.error = null;
    },
    getSummarySuccess: (state, action: PayloadAction<AnalyticsSummary>) => {
      state.loading = false;
      state.summary = action.payload;
      state.trends = action.payload.trends;
      state.categories = action.payload.categories;
      state.paymentMethods = action.payload.paymentMethods;
      state.topCategories = action.payload.topCategories;
      state.forecast = action.payload.forecast;
    },
    getSummaryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear analytics
    clearAnalytics: (state) => {
      state.trends = [];
      state.categories = [];
      state.paymentMethods = [];
      state.topCategories = [];
      state.forecast = null;
      state.summary = null;
      state.error = null;
    },
  },
});

export const {
  getTrendsRequest,
  getTrendsSuccess,
  getTrendsFailure,
  getCategoriesRequest,
  getCategoriesSuccess,
  getCategoriesFailure,
  getPaymentMethodsRequest,
  getPaymentMethodsSuccess,
  getPaymentMethodsFailure,
  getTopCategoriesRequest,
  getTopCategoriesSuccess,
  getTopCategoriesFailure,
  getForecastRequest,
  getForecastSuccess,
  getForecastFailure,
  getSummaryRequest,
  getSummarySuccess,
  getSummaryFailure,
  clearAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

