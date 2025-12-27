import React, { useState } from "react";
import { Button, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useTheme } from "../utils/color";
import InputBox from "@/component/InputBox";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Haptics from 'expo-haptics';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
const SignUpPage = () => {
  const theme = useTheme() // Reactive theme hook
  const dispatch = useDispatch()
  const router = useRouter()
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [errorFields,setErrorFields] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      setDateOfBirth(selectedDate);
    }
    // setShowPicker(false)
  };

  const signupSuccess = (data?:any) => {
    console.log("Signup successful", data)
    setIsLoading(false)
    Alert.alert('Success', 'Account created successfully! Please login.', [
      {
        text: 'OK',
        onPress: () => router.push('/screen/login_page')
      }
    ])
  }

  const signupFailure = (error:any) => {
    console.error("❌ [SignUpPage] Signup failure:", {
      error,
      message: error?.message,
      status: error?.status,
      code: error?.code,
      data: error?.data
    })
    setIsLoading(false)
    
    // Use the error message from saga (which has detailed info)
    let errorMessage = error?.message || 'Failed to create account. Please try again.';
    
    // Log full error for debugging
    console.error("❌ [SignUpPage] Full error object:", JSON.stringify(error, null, 2))
    
    Alert.alert('Signup Failed', errorMessage, [
      {
        text: 'OK',
        onPress: () => console.log('OK Pressed')
      }
    ])
  }

  const handleSubmit=()=>{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const isValid = validation()
    if(isValid){ // Fixed: Changed from !isValid to isValid
      setIsLoading(true)
      const callback = {
        success: signupSuccess,
        failure: signupFailure
      }
      
      // Format date as ISO string for backend (YYYY-MM-DD format)
      let formattedDate = '';
      if(dateOfBirth) {
        // Format as YYYY-MM-DD for backend
        const year = dateOfBirth.getFullYear();
        const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
        const day = String(dateOfBirth.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }
      
      const payload = {
        user_name: userName.trim(),
        email: email.trim(),
        password: password,
        date_of_birth: formattedDate,
        callback: callback
      }
      
      dispatch({type: "signup", payload})
    } else {
      // Show validation errors
      console.log("Validation failed", errorFields)
    }
  }

  const validation = ()=>{
    let errors:any = {}
    let hasError = false
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if(!userName || userName.trim().length<2){
      errors.name="User Name must be more than 2 characters"
      hasError=true
    }
    if(!password || !passwordRegex.test(password)){
      errors.password="Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character."
      hasError=true
    }
    if(!email || !emailRegex.test(email.trim())){
      errors.email = "Please enter a valid email address"
      hasError=true
    }
    if(!dateOfBirth){
      errors.dateOfBirth="Please select the date of birth"
      hasError=true
    }
    setErrorFields(errors)
    return !hasError // Return true if valid, false if has errors
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <View
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          gap: 10,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        <View style={styles.errorBox}>
        <InputBox
          type="string"
          value={userName}
          setValue={(val) => {
            setUserName(val)
            setErrorFields((prev:any)=>({
              ...prev,
              name:""
            }))
          }}
          placeholder={"User Name"}
        />
        <Text style={{color: theme.errorText, fontWeight:500, fontSize:16}}>
          {errorFields?.hasOwnProperty('name') ? errorFields?.['name']:""}
        </Text>
        </View>
        <View style={styles.errorBox}>
       
        <InputBox
          type="password"
          value={password}
          setValue={(val) => {
            setPassword(val)
            setErrorFields((prev:any)=>({
              ...prev,
              password:""
            }))
          }}
          placeholder="Password"
        />
        <Text style={{color: theme.errorText, fontWeight:500, fontSize:16}}>
          {errorFields?.hasOwnProperty('password') ? errorFields?.['password']:""}
        </Text>
           
        </View>
        <View style={styles.errorBox}>

        <InputBox 
          type="string"
          value={email} 
          setValue={(val) => {
            setEmail(val)
            setErrorFields((prev:any)=>({
              ...prev,
              email:""
            }))
          }} 
          placeholder="Email" 
        />
        <Text style={{color: theme.errorText, fontWeight:500, fontSize:16}}>
          {errorFields?.hasOwnProperty('email') ? errorFields?.['email']:""}
        </Text>
        </View>
        <View style={styles.errorBox}>
        <Pressable
          onPress={() => {setShowPicker(true);setErrorFields({})}}
          style={{
            padding: 16,
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: 12,
            width: 300,
            borderColor: theme.appPrimary,
          }}
        >
          {dateOfBirth ? (
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.textPrimary,
              }}
            >
              {dateOfBirth?.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          ) : (
            <Text style={{ fontSize: 18, fontWeight: 500, color: theme.textPrimary + '80' }}>
              Date of Birth
            </Text>
          )}
        </Pressable>
          <Text style={{color: theme.errorText, fontWeight:500, fontSize:16}}>
          {errorFields?.hasOwnProperty('dateOfBirth') ? errorFields?.['dateOfBirth']:""}
        </Text>
        </View>
        {showPicker && (
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DateTimePicker
              mode="date"
              value={dateOfBirth ? dateOfBirth : new Date()}
              display="spinner"
              onChange={onChange}
            />
            <Button title="Done" onPress={() => setShowPicker(false)} />
          </View>
        )}
        {/* <InputBox  value={userName}  setValue={setUserName} placeholder='User Name or Email'/> */}
  
        {!showPicker && 
      <TouchableOpacity 
        style={{
          height:50,
          width:300,
          justifyContent:"center",
          alignItems:"center",
          backgroundColor: isLoading ? theme.appPrimary + '80' : theme.appPrimary,
          borderRadius:12,
          padding:12,
          shadowColor:'rgb(51, 122, 188)',
          shadowOffset:{width:0,height:4},
          shadowOpacity:2,
          shadowRadius:5,
          elevation: 3,
          marginTop:40,
          opacity: isLoading ? 0.6 : 1
        }} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={{fontSize:20,fontWeight:600,color:theme.primarylight }}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
}
      </View>
    </ScrollView>
  );
};

export default SignUpPage;

// Styles that don't depend on theme
export const styles = StyleSheet.create({
    errorBox:{
        flexDirection:"column",
        gap:6,
       width:300
    },
})

// Error text style needs to be inline or use theme hook
// Using inline style in component instead