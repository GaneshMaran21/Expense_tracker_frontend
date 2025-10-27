import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import themeConfig from './utils/color'
import FastImage from "react-native-fast-image";
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from "lottie-react-native";
import useIsDark from './utils/useIsDark';

const HomePage = () => {
   
  return (


   
   <View style={{ flex:1,
        backgroundColor:useIsDark()? themeConfig.primaryD : themeConfig.primaryL,height:200,width:"100%",justifyContent:"center",alignItems:"center"
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