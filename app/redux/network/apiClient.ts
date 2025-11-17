// app/network/apiClient.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const apiClient = axios.create({
  // baseURL: "http://172.20.10.2:2222",
  baseURL: 'https://expense-tracker-backend-aqyq.onrender.com',
  timeout: 10000,
  headers: {
    "x-client-type": "mobile",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const skipAuth = ["/signin", "/signup"];
    const shouldAttachToken = !skipAuth.some((url) =>
      config.url?.includes(url)
    );

    if (shouldAttachToken) {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  async (response) => {
    console.log(response?.headers,"axios response")
    const accessToken = response?.data?.accessToken;
    const user_id = response?.data?.user_name
    const newAccessToken = response.headers["new-access-token"];
    if (newAccessToken==='true') {
      console.log("🔄 Updating access token...");
      await SecureStore.setItemAsync("accessToken", accessToken);
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
    const networkErrorJSON = {
      status: 0,
      data: null,
      message: error.message || "Network Error",
    };

    console.log("🌐 Network Error JSON:", networkErrorJSON);
    return Promise.reject(networkErrorJSON);
  }
);

export default apiClient;