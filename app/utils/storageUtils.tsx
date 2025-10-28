import * as SecureStore from 'expo-secure-store';

  export  const setSecureItem = async(key:string,value:any)=>{
        await SecureStore.setItemAsync(key,value)
    }
  
    export const getSecureItem = async(key:string)=>{
     const item =  await SecureStore.getItemAsync(key)
     return item 
    }

    export const deleteSecureItem = async(key:string)=>{
      await SecureStore.deleteItemAsync(key)
    }