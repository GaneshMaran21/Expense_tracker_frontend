import { HapticTab } from '@/app-example/components/haptic-tab'
import themeConfig from '@/app/utils/color'
import useIsDark from '@/app/utils/useIsDark'
import Button from '@/component/button'
import InputBox from '@/component/InputBox'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {  Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics';
import { useDispatch } from 'react-redux'
const LoginPage = () => {
    const [userName,setUserName] = useState<string>("")
    const [password,setPassword] = useState<string>("")
    const [error,setError] = useState(false)
    const [fieldError,setFieldError] = useState<any>({})
    const router = useRouter()
    const dispatch = useDispatch()
    const validate =()=>{
      let hasError = false
      if(!userName || userName.length<=2){
        fieldError.userName = "userName should have atleast 2 characters"
        hasError = true
      }
      if(!password || password.length<=2){
        fieldError.password="Password is required"
        hasError = true
      }
      return hasError
    }

    const loginSuccess = ()=>{
      router.push('/screen/logOut')
    }
    const handleSubmit =()=>{
      debugger
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const callback = {
        success:loginSuccess()
      }
      if(!validate()){
        const payload={
          user_name:userName,
          password:password
        }
        dispatch({type:"signin",payload})
      }

     }

  return (

    <SafeAreaView style={{flex:1,backgroundColor:themeConfig.primary,borderWidth:1,borderStyle:"solid"}}>
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
      <View style={{ flexDirection:"column",gap:20,alignItems:"center",marginTop:50,}}>
        {error ? 
            <View style={{display:"flex",flexDirection:"row",backgroundColor:themeConfig.errorContainer,borderRadius:12,paddingHorizontal:12,paddingVertical:8,alignItems:"center",justifyContent:"space-between",gap:12}}>
                <View style={{borderRadius:"50%",backgroundColor:themeConfig.errorText,height:30,width:30,alignItems:"center",justifyContent:"center",}}>
                  <Text style={{fontSize:20,fontWeight:700,color:themeConfig.primarylight}}>!</Text>
                </View>
                <View>
                  <Text style={{color:themeConfig.errorText,fontSize:16,fontWeight:400}}>
                    Incorrect user name or password
                  </Text>
                </View>
            </View>
           : <></> }
          <InputBox type='userName' value={userName}  setValue={setUserName} placeholder='User Name or Email'/>
          <InputBox type='password' value={password}  setValue={setPassword} placeholder='Password'/>
      </View>
      <View style={{display:"flex",width:300,marginTop:30}}>
      <Button title='Log In' onPress={handleSubmit}/>
      </View>

      <View style={{display:"flex",justifyContent:"space-between",flexDirection:"row",marginTop:30}}>
        <Text style={{fontSize:16,fontWeight:700,color:themeConfig.textPrimary}}>
          Don't you have an account ?
        </Text>
        <Pressable style={{marginLeft:4}} onPress={()=>router.push('/screen/signUpPage')}>
          <Text style={{color:themeConfig.appPrimary,fontSize:16,fontWeight:700}}>
            Register Here
          </Text>
        </Pressable>
      </View>
    </View>
          </TouchableWithoutFeedback>  
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default LoginPage