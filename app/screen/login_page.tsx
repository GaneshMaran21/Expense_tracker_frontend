import themeConfig from '@/app/utils/color'
import isDark from '@/app/utils/isDark'
import InputBox from '@/component/InputBox'
import React, { useState } from 'react'
import {  Image, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const LoginPage = () => {
    const _isDark = isDark() ? themeConfig.primaryD : themeConfig?.primaryL
    const [userName,setUserName] = useState<string>("")
    const [password,setPassword] = useState<string>("")
  return (

    <SafeAreaView style={{flex:1,backgroundColor:_isDark,borderWidth:1,borderStyle:"solid"}}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS ==="ios" ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={{flex:1,flexDirection:"column",alignItems:"center",gap:30}}>
      <View style={{flexDirection:"column",gap:10,alignItems:"center",marginTop:20}}>
           <View style={{}}>
                      <Image source={require("../../assets/icon/wallet.png")} />
                    </View>
                      <View style={{ display: "flex" }}>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: 700,
                  color: themeConfig.appPrimary,
                  marginTop: 10,
                }}
              >
                EX-Tracker
              </Text>
            </View>
      </View>
      <View style={{ flex:1,flexDirection:"column",gap:20,alignItems:"center",marginTop:20}}>
          <InputBox type='userName' value={userName}  setValue={setUserName}/>
          <InputBox type='password' value={password}  setValue={setPassword}/>
      </View>
    </View>
          </TouchableWithoutFeedback>  
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default LoginPage