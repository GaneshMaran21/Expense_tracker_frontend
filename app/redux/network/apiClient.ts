// app/network/apiClient.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { redirectToProfile } from "../../utils/navigationUtils";

const apiClient = axios.create({
  baseURL: "http://172.20.10.2:2222", // Local development
  // baseURL: 'https://expense-tracker-backend-aqyq.onrender.com',
  timeout: 30000, // 30 seconds timeout
  headers: {
    "x-client-type": "mobile",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // Log request
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    if (config.params) {
      console.log('📋 Request params:', JSON.stringify(config.params, null, 2));
    }
    
    const skipAuth = ["/signin", "/signup", "/signUp"];
    const shouldAttachToken = !skipAuth.some((url) =>
      config.url?.toLowerCase().includes(url.toLowerCase())
    );

    if (shouldAttachToken) {
      const token = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Access token attached to request:", config.url);
      } else {
        console.warn("⚠️ No access token found for request:", config.url);
      }
      
      // Also send refresh token in header for token refresh mechanism
      if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  async (response) => {
    console.log(response?.headers,"axios response")
    const accessToken = response?.data?.accessToken;
    const refreshToken = response?.data?.refreshToken;
    const user_id = response?.data?.user_name
    const newAccessToken = response.headers["new-access-token"] || response.headers["x-access-token"];
    
    // Handle token refresh from headers (backend sends new tokens in headers)
    if (newAccessToken) {
      const newToken = response.headers["x-access-token"] || accessToken;
      const newRefreshToken = response.headers["x-refresh-token"] || refreshToken;
      
      if (newToken) {
        console.log("🔄 Updating access token from response...");
        await SecureStore.setItemAsync("accessToken", newToken);
      }
      
      if (newRefreshToken) {
        console.log("🔄 Updating refresh token from response...");
        await SecureStore.setItemAsync("refreshToken", newRefreshToken);
      }
      
      if(user_id){
        await SecureStore.setItemAsync("user_name",user_id)
      }
    }
    
    // Also handle tokens in response body (for signin/signup)
    if (accessToken && !newAccessToken) {
      await SecureStore.setItemAsync("accessToken", accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync("refreshToken", refreshToken);
      }
      if(user_id){
        await SecureStore.setItemAsync("user_name",user_id)
      }
    }
    
    return response;
  },
  async (error) => {
    console.log("❌ API Error Interceptor Triggered");

    // If response is available (server-side error)
    if (error.response) {
      // Handle 401 Unauthorized - token expired or missing
      if (error.response.status === 401) {
        const errorData = error.response.data;
        console.log("🔒 401 Unauthorized - Token issue:", errorData);
        
        // Clear tokens (but don't redirect yet - let component show alert first)
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        
        // Return error with clear message (component will handle alert and redirect)
        const fullErrorJSON = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: {
            ...errorData,
            message: errorData?.message || "Session expired. Please login again.",
            requiresLogin: true, // Flag to indicate login is needed
          },
          message: errorData?.message || "Session expired. Please login again.",
        };

        console.log("📦 Full Error JSON:", fullErrorJSON);
        return Promise.reject(fullErrorJSON);
      }
      
      const fullErrorJSON = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data, // 👈 The actual JSON returned by backend
        message: error.message,
      };

      console.log("📦 Full Error JSON:", fullErrorJSON);
      return Promise.reject(fullErrorJSON); // 👈 reject full JSON
    }

    // If no response (network error, timeout, etc.)
    let errorMessage = error.message || "Network Error";
    
    // Provide more helpful error messages
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏱️ Request timeout after 30 seconds');
      console.error('🔍 Request details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        params: error.config?.params
      });
      errorMessage = "Request timed out after 30 seconds. Please check:\n1. Backend server is running on http://172.20.10.2:2222\n2. Device is on the same network\n3. Backend is accessible";
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('🌐 Network error:', error.message);
      console.error('🔍 Request details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      });
      errorMessage = "Network error. Please check:\n1. Your internet connection\n2. Backend server is running\n3. Device can reach http://172.20.10.2:2222";
    } else {
      console.error('❌ Unknown network error:', error);
    }
    
    const networkErrorJSON = {
      status: 0,
      data: null,
      message: errorMessage,
      code: error.code,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      }
    };

    console.log("🌐 Network Error JSON:", networkErrorJSON);
    return Promise.reject(networkErrorJSON);
  }
);

export default apiClient;