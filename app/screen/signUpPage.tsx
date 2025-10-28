import React, { useState } from "react";
import { Button, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import themeConfig from "../utils/color";
import useIsDark from "../utils/useIsDark";
import InputBox from "@/component/InputBox";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Haptics from 'expo-haptics';
const SignUpPage = () => {
  const is_dark = useIsDark()
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [errorFields,setErrorFields] = useState<any>({})
  console.log(errorFields,"error")
  console.log(showPicker);
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      setDateOfBirth(selectedDate);
    }
    // setShowPicker(false)
  };

  const handleSubmit=()=>{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    console.log(validation(),"vALID")
   if(validation()){
     
   }
   else{
    console.log("validation failed")
   }
  }

  const validation = ()=>{
    let errors:any = {}
    let hasError = false
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(userName.length<2 || !userName.length){
      errors.name="User Name must be more than 2 characters"
      hasError=true
    }
    if(!password.length || !passwordRegex.test(password)){
      errors.password="Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character."
      hasError=true
    }
    if(!email.length || !emailRegex.test(email)){
      errors.email = "please enter valid email address"
      hasError=true
    }
    if(!dateOfBirth){
      errors.dateOfBirth="please select the date of birth"
      hasError=true
    }
    setErrorFields(errors)
    return hasError ? false : true
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: themeConfig.primary,
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
          value={userName}
          setValue={setUserName}
          placeholder={"User Name"}
          onFocus={()=>setErrorFields((prev:{})=>({
            ...prev,
            name:""
          }))}
        />
        <Text style={styles.errorText}>
          {errorFields?.hasOwnProperty('name') ? errorFields?.['name']:""}
        </Text>
        </View>
        <View style={styles.errorBox}>
       
        <InputBox
          value={password}
          setValue={setPassword}
          placeholder="Password"
            onFocus={()=>setErrorFields((prev:{})=>({
            ...prev,
            password:""
          }))}
        />
        <Text style={styles.errorText}>
          {errorFields?.hasOwnProperty('password') ? errorFields?.['password']:""}
        </Text>
           
        </View>
        <View style={styles.errorBox}>

        <InputBox value={email} setValue={setEmail} placeholder="Email" 
          onFocus={()=>setErrorFields((prev:{})=>({
            ...prev,
            email:""
          }))}
        />
        <Text style={styles.errorText}>
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
            borderColor: themeConfig.appPrimary,
          }}
        >
          {dateOfBirth ? (
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: themeConfig.textPrimary,
              }}
            >
              {dateOfBirth?.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          ) : (
            <Text style={{ fontSize: 18, fontWeight: 500, color:is_dark?"#555": "#ccc" }}>
              Date of Birth
            </Text>
          )}
        </Pressable>
          <Text style={styles.errorText}>
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
      <TouchableOpacity style={{height:50,width:300,justifyContent:"center",alignItems:"center",backgroundColor:themeConfig?.appPrimary,borderRadius:12,padding:12,shadowColor:'rgb(51, 122, 188)',shadowOffset:{width:0,height:4},shadowOpacity:2,shadowRadius:5,elevation: 3,marginTop:40 }} onPress={handleSubmit}>
        <Text style={{fontSize:20,fontWeight:600,color:themeConfig.primarylight }}>
          Sign Up
        </Text>
      </TouchableOpacity>
}
      </View>
    </ScrollView>
  );
};

export default SignUpPage;

export const styles = StyleSheet.create({
    errorBox:{
        flexDirection:"column",
        gap:6,
       width:300
    },
    errorText:{
      color:themeConfig.errorText,
      fontWeight:500,
      fontSize:16
    }
})