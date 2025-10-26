import React, { useState } from "react";
import { View, TextInput, Image, StyleSheet, Pressable } from "react-native";
import themeConfig from "@/app/utils/color";
import isDark from "@/app/utils/isDark";

interface InputBoxProps {
  type?: "userName" | "password";
  value: string;
  setValue: (text: string) => void;
  placeholder?: string;
}

const InputBox = ({ type, value, setValue, placeholder }: InputBoxProps) => {
  const _isDarkMode = isDark()  
  const _isDark = _isDarkMode  ? themeConfig.primaryD : themeConfig.primaryL;

  const [highlight, setHighlight] = useState<number>(0);
    const [isPassword,setIsPassword] = useState(type === "password")
  const isUser = type === "userName";
//   const isPassword = type === "password";

  
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: _isDark,
            borderColor:
              (isUser && highlight === 1) || (type==="password" && highlight === 2)
                ? _isDarkMode ? themeConfig.primaryL :themeConfig.inputBox
                : themeConfig.appPrimary,
          },
        ]}
      >
        {isUser && <Image source={require("../assets/icon/user.png")} />}
        {type ==="password" && <Image source={require("../assets/icon/password.png")} />}
        <TextInput
          style={[styles.textInput,{
            color :_isDarkMode ? themeConfig.primaryL : themeConfig.appPrimary,
            letterSpacing:1,
            fontWeight:500
          }]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          secureTextEntry={isPassword}
          onFocus={() => setHighlight(isUser ? 1 : 2)}
          onBlur={() => setHighlight(0)}
          
        />
        {type ==="password" &&
            <Pressable onPress={()=>setIsPassword(!isPassword)}>
               {isPassword ?  
                 <Image source={require("../assets/icon/passwordhide.png")}  />
               :
               <Image source={require("../assets/icon/passwordshow.png")}  /> 
              
               } 
                
            </Pressable>
        }

      </View>
    </View>
  );
};

export default InputBox;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    // paddingHorizontal: 2,
    width:300,
    paddingHorizontal:8
  },
  textInput: {
    flex: 1,
    height: 50,
    width:200,
    fontSize: 18,
    paddingHorizontal: 10,
  },
});