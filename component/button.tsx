import { useTheme } from '@/app/utils/color'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import useIsDark from '@/app/utils/useIsDark'

interface ButtonProps{
    title?:string,
    backgroundColor?:string,
    color?:string,
    isLoading?:boolean,
    setIsLoading?:()=>void,
    onPress?:()=>void,
    fontColor?:string
}

const Button = (props:ButtonProps) => {
  const theme = useTheme() // Reactive theme hook
  const isDark = useIsDark() // Get dark mode state
  
  // Theme-based shadow color
  const shadowColor = isDark ? '#000' : '#00000030'
  
  return (
    <TouchableOpacity 
      style={{
        height:50,
        width:"100%",
        justifyContent:"center",
        alignItems:"center",
        backgroundColor: props?.backgroundColor ? props?.backgroundColor : theme.appPrimary,
        borderRadius:12,
        padding:12,
        shadowColor: shadowColor,
        shadowOffset: {width:0, height:4},
        shadowOpacity: isDark ? 0.5 : 0.3,
        shadowRadius: 5,
        elevation: 3,
      }} 
      onPress={props.onPress}
    >
        <Text style={{
          fontSize:20,
          fontWeight:'600',
          color: props?.fontColor ? props?.fontColor : theme.primarylight
        }}>
          {props?.title}
        </Text>
    </TouchableOpacity>
  )
}

export default Button

// const styles = StyleSheet.create({
//     button:{
//         height:200,
//         width:"100%",
//         color:
//     }
// })