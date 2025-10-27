import React, { useState } from "react";
import { Button, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import themeConfig from "../utils/color";
import useIsDark from "../utils/useIsDark";
import InputBox from "@/component/InputBox";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Haptics from 'expo-haptics';
const SignUpPage = () => {
  const is_dark = useIsDark();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  console.log(showPicker);
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      setDateOfBirth(selectedDate);
    }
    // setShowPicker(false)
  };

  const handleSubmit=()=>{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: is_dark ? themeConfig.primaryD : themeConfig.primaryL,
      }}
    >
      <View
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          gap: 30,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        <InputBox
          value={userName}
          setValue={setUserName}
          placeholder="User Name"
        />
        <InputBox
          value={password}
          setValue={setPassword}
          placeholder="Password"
        />
        <InputBox value={email} setValue={setEmail} placeholder="Email" />

        <Pressable
          onPress={() => setShowPicker(true)}
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
                color: is_dark ? themeConfig.primaryL : themeConfig.appPrimary,
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
        <Text style={{fontSize:20,fontWeight:600,color:themeConfig.primaryL }}>
          Sign Up
        </Text>
      </TouchableOpacity>
}
      </View>
    </ScrollView>
  );
};

export default SignUpPage;
