// app/network/apiClient.ts
import axios from "axios";
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: "https://expense-tracker-backend-aqyq.onrender.com" ,
//   baseURL:"http://172.20.10.2:3000",// example
  timeout: 10000,
    headers: {
    "x-client-type": "mobile",
  },
});

apiClient.interceptors.request.use(
   (config) => {
    debugger
    const skipAuth = ["/signin", "/signup"];
    const shouldAttachToken = !skipAuth.some((url) => config.url?.includes(url));

    if (shouldAttachToken) {
      const token =  SecureStore.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  async(response) => {
     const newAccessToken = response.headers["newaccesstoken"];
    if (newAccessToken) {
      console.log("🔄 Updating access token...");
      await SecureStore.setItem("accessToken", newAccessToken);
    }
    return response;
  },
  (error) => {
    console.log(error,"error")
    // console.log("API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);
export default apiClient;