import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { useTheme } from './utils/color'
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from "lottie-react-native";

const HomePage = () => {
  const theme = useTheme() // Reactive theme hook
   
  return (


   
   <View style={{ flex:1,
        backgroundColor:theme.primary,height:200,width:"100%",justifyContent:"center",alignItems:"center",zIndex:10000
       }}>
        {/* <View style={{flex:1,borderColor:"red",borderRadius:1, borderStyle:"solid",borderWidth:1,width:300}}> */}

       
     {/* <Image
        source={require("../assets/gif/Welcome.gif")}
        style={{ width:300,height:100 }}
      /> */}
        <LottieView
        source={require("../assets/lottie/Welcome.json")} // path to your .lottie file
        autoPlay
        loop
        style={{ width: 300, height: 300 }}
      />
       {/* </View> */}
   </View>

  )
}

export default HomePage
 
const styles= StyleSheet.create({
    container:{
       

    }
})