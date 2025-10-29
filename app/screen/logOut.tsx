import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { deleteSecureItem, getSecureItem } from '../utils/storageUtils'

const LogOut = () => {
    const handleLogOut=async()=>{
       const acc =  await getSecureItem('accessToken')
       console.log(acc,"token")
        // deleteSecureItem('accessToken');
        // deleteSecureItem('refreshToken')
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