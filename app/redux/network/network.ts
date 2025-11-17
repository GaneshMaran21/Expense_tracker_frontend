// app/features/user/userApi.ts
import apiClient from "../network/apiClient";
import { endpoints } from "../endpoint/endpoint";

export const getUser = async(id: string) => {
  return await apiClient.get(`${endpoints.getUser}/${id}`);
};

export const userSignIn =async (payload:any) =>{
    debugger
    const response =  await apiClient.post(endpoints.sigin,payload)
    return response
}