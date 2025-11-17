import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import HomeIcon from '../assets/icon/home.svg'
import Setting from '../assets/icon/settings.svg'
import Notification from '../assets/icon/notification.svg'
import Calender from '../assets/icon/calendar.svg'
import themeConfig from '@/app/utils/color'
import { useRouter } from 'expo-router'


const Footer = () => {
  const route = useRouter()
  return (
    <View
          style={{
            height: 100,
            backgroundColor: "#ffffff",
            alignItems: "center",
            // justifyContent: "space-around",
            flexDirection:"row",
            gap:30,
        
          }}
        >
         <Pressable  onPress={()=>route.push('/screen/homePage')}>
          <HomeIcon height={40} width={40}/>
         </Pressable>
         <Pressable  onPress={()=>route.push('/screen/ListPage')}>
          <Calender height={40} width={40}/>
         </Pressable>
         <Pressable style={styles.centerButton}  onPress={()=>route.push('/screen/MainPage')}>
            <Text style={styles.textColor}>
                +
            </Text>
         </Pressable>
         <Pressable  onPress={()=>route.push('/screen/notification')}>
          <Notification height={40} width={40}/>
         </Pressable>
         <Pressable  onPress={()=>route.push('/screen/settings')}>
          <Setting height={40} width={40}/>
         </Pressable>
          </View>
  )
}

export default Footer

export const styles = StyleSheet.create({
        centerButton:{
            height:60,
            width:60,
            borderRadius:"50%",
            marginBottom:40,
            backgroundColor:themeConfig.appPrimary,
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
        },
        textColor:{
            fontWeight:700,
            color:themeConfig.primarylight,
            fontSize:30
        }
})  