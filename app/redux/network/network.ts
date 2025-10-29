// app/features/user/userApi.ts
import apiClient from "../network/apiClient";
import { endpoints } from "../endpoint/endpoint";

export const getUser = (id: string) => {
  return apiClient.get(`${endpoints.getUser}/${id}`);
};

export const userSignIn = (payload:any) =>{
    debugger
    const response =  apiClient.post(endpoints.sigin,payload)
    return response
}