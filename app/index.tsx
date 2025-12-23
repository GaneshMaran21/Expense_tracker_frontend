import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";
import { useTheme } from "../app/utils/color";
import HomePage from "./homepage";
import { useEffect, useState } from "react";
import { getSecureItem, setSecureItem } from "./utils/storageUtils";
import { useDispatch } from "react-redux";
export default function Index() {
  const theme = useTheme() // Reactive theme hook
  const router = useRouter()
  const [isFirstTime,setIsFirstTime] = useState(true)
  async function getItemFromStorage(key:string) {
     return await getSecureItem(key)
  }
  const dispatch = useDispatch()

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const item = await getItemFromStorage("accessToken");
        const user_name = await getItemFromStorage('user_name')
        if (item && user_name) {
          console.log("Token and user found  :", item,user_name);
          router.push('/screen/HomePage')
        } else {
          console.log("No token found. Sign in or sign up");
          router.push("/profile");
        }
      } catch (error) {
        console.error("Error checking token:", error);
      }
    }, 5000); // waits 5 seconds

    // Cleanup if component unmounts before timeout
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        backgroundColor:theme.background
      }}
    >
      {/* <Text>Edit app/index.tsx to edit this screen.</Text> */}
      {isFirstTime ? <HomePage/> : null}
     {/* <Button title="Go to index" onPress={()=>router.push('/profile')}></Button> */}
    </View>
  );
}
export const options = {
  headerShown: false,
};
