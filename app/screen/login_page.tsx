import { HapticTab } from '@/app-example/components/haptic-tab'
import { useTheme } from '@/app/utils/color'
import Button from '@/component/button'
import InputBox from '@/component/InputBox'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {  Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics';
import { useDispatch } from 'react-redux'
const LoginPage = () => {
  const theme = useTheme() // Reactive theme hook
    const [userName,setUserName] = useState<string>("")
    const [password,setPassword] = useState<string>("")
    const [error,setError] = useState(false)
    const [fieldError,setFieldError] = useState<any>({})
    const router = useRouter()
    const dispatch = useDispatch()
    const validate =()=>{
      let hasError = false
      const newFieldError:any = {}
      if(!userName || userName.trim().length<2){
        newFieldError.userName = "User name or email is required"
        hasError = true
      }
      if(!password || password.length<8){
        newFieldError.password="Password must be at least 8 characters"
        hasError = true
      }
      setFieldError(newFieldError)
      return hasError
    }

    const loginSuccess = (data?:any)=>{
      console.log("Login successful", data)
      // Navigate to home page after successful login
      router.push('/screen/HomePage')
    }
    const loginFailure = (error:any)=>{
      console.error("❌ [LoginPage] Login failure:", {
        error,
        message: error?.message,
        status: error?.status,
        code: error?.code,
        data: error?.data
      })
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      
      // Use the error message from saga (which has detailed info)
      let errorMessage = error?.message || 'Login failed. Please try again.';
      
      // Log full error for debugging
      console.error("❌ [LoginPage] Full error object:", JSON.stringify(error, null, 2))
      
      Alert.alert('Login Failed', errorMessage, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    }
    const handleSubmit =()=>{
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const callback = {
        success:loginSuccess,
        failure:loginFailure
      }
      const validationError = validate()
      if(!validationError){
        const payload={
          user_name:userName.trim(),
          password:password,
          callback:callback
        }
        dispatch({type:"signin",payload})
      } else {
        setError(true)
      }

     }

  return (

    <SafeAreaView style={{flex:1,backgroundColor:theme.background}}>
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
                  color: theme.appPrimary,
                  marginTop: 10,
                }}
              >
                EX-Tracker
              </Text>
            </View>
      </View>
      <View style={{ flexDirection:"column",gap:20,alignItems:"center",marginTop:50,}}>
        {error ? 
            <View style={{display:"flex",flexDirection:"row",backgroundColor:theme.errorContainer,borderRadius:12,paddingHorizontal:12,paddingVertical:8,alignItems:"center",justifyContent:"space-between",gap:12}}>
                <View style={{borderRadius:15,backgroundColor:theme.errorText,height:30,width:30,alignItems:"center",justifyContent:"center",}}>
                  <Text style={{fontSize:20,fontWeight:700,color:theme.primarylight}}>!</Text>
                </View>
                <View>
                  <Text style={{color:theme.errorText,fontSize:16,fontWeight:400}}>
                    Incorrect user name or password
                  </Text>
                </View>
            </View>
           : <></> }
          <InputBox 
            type='userName' 
            value={userName}  
            setValue={(val) => {
              setUserName(val)
              setError(false)
              setFieldError((prev:any) => ({...prev, userName: ""}))
            }} 
            placeholder='User Name or Email'
          />
          {fieldError?.userName && (
            <Text style={{color: theme.errorText, fontSize: 14, alignSelf: 'flex-start', marginLeft: 20}}>
              {fieldError.userName}
            </Text>
          )}
          <InputBox 
            type='password' 
            value={password}  
            setValue={(val) => {
              setPassword(val)
              setError(false)
              setFieldError((prev:any) => ({...prev, password: ""}))
            }} 
            placeholder='Password'
          />
          {fieldError?.password && (
            <Text style={{color: theme.errorText, fontSize: 14, alignSelf: 'flex-start', marginLeft: 20}}>
              {fieldError.password}
            </Text>
          )}
      </View>
      <View style={{display:"flex",width:300,marginTop:30}}>
      <Button title='Log In' onPress={handleSubmit}/>
      </View>

      <View style={{display:"flex",justifyContent:"space-between",flexDirection:"row",marginTop:30}}>
        <Text style={{fontSize:16,fontWeight:700,color:theme.textPrimary}}>
          Don't you have an account ?
        </Text>
        <Pressable style={{marginLeft:4}} onPress={()=>router.push('/screen/signUpPage')}>
          <Text style={{color:theme.appPrimary,fontSize:16,fontWeight:700}}>
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