import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { deleteSecureItem, getSecureItem } from '../utils/storageUtils'
import { useRouter } from 'expo-router'


const LogOut = () => {
  const route = useRouter()
    const handleLogOut=async()=>{
       const acc =  await getSecureItem('accessToken')
       const user = await getSecureItem('user_name')
       console.log(acc,user,"token")
      await  deleteSecureItem('accessToken');
      await  deleteSecureItem('refreshToken')
      await  deleteSecureItem('user_name')
      route.push('/profile')
    }
  return (
    <Pressable onPress={handleLogOut}>
        <Text>
                Logout
        </Text>
    </Pressable>
  )
}

export default LogOut