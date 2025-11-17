import React, { useEffect, useState } from "react";
import { View, TextInput, Image, StyleSheet, Pressable } from "react-native";
import themeConfig from "@/app/utils/color";
import useIsDark from "@/app/utils/useIsDark";

interface InputBoxProps {
  type?: "userName" | "password" | "string";
  value: string;
  setValue: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

const InputBox = ({ type, value, setValue, placeholder, onFocus }: InputBoxProps) => {
  const _useIsDarkMode = useIsDark();
  const _useIsDark = _useIsDarkMode ? themeConfig.primaryDark : themeConfig.primarylight;

  const [highlight, setHighlight] = useState<number>(0);
  const [isPassword, setIsPassword] = useState(type === "password");

  useEffect(() => {
    // Reset when type changes to avoid hook mismatches
    setIsPassword(type === "password");
  }, [type]);

  const isUser = type === "userName";
  const isPasswordType = type === "password";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: _useIsDark,
            borderColor:
              (isUser && highlight === 1) || (isPasswordType && highlight === 2)
                ? _useIsDarkMode
                  ? themeConfig.primarylight
                  : themeConfig.inputBox
                : themeConfig.appPrimary,
          },
        ]}
      >
        {isUser && <Image source={require("../assets/icon/user.png")} />}
        {isPasswordType && <Image source={require("../assets/icon/password.png")} />}

        <TextInput
          style={[
            styles.textInput,
            {
              color: _useIsDarkMode ? themeConfig.primarylight : themeConfig.appPrimary,
              letterSpacing: 1,
              fontWeight: "500",
            },
          ]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          secureTextEntry={isPasswordType && isPassword}
          onFocus={() => {
            setHighlight(isUser ? 1 : 2);
            onFocus && onFocus();
          }}
          onBlur={() => setHighlight(0)}
          placeholderTextColor={_useIsDarkMode ? "#555" : "#ccc"}
        />

        {isPasswordType && (
          <Pressable onPress={() => setIsPassword(!isPassword)}>
            {isPassword ? (
              <Image source={require("../assets/icon/passwordhide.png")} />
            ) : (
              <Image source={require("../assets/icon/passwordshow.png")} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default InputBox;

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    width: 300,
    paddingHorizontal: 8,
  },
  textInput: {
    flex: 1,
    height: 50,
    width: 200,
    fontSize: 18,
    paddingHorizontal: 10,
  },
});