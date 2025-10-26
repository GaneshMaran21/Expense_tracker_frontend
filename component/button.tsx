import themeConfig from '@/app/utils/color'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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
  return (
    <TouchableOpacity style={{height:50,width:"100%",justifyContent:"center",alignItems:"center",backgroundColor:props?.backgroundColor ? props?.backgroundColor : themeConfig?.appPrimary,borderRadius:12,padding:12,shadowColor:'rgb(51, 122, 188)',shadowOffset:{width:0,height:4},shadowOpacity:2,shadowRadius:5,elevation: 3, }} onPress={props.onPress}>
        <Text style={{fontSize:20,fontWeight:600,color:props?.fontColor ? props?.fontColor : themeConfig?.primaryL}}>
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