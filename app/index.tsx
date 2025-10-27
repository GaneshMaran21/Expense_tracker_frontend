import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";
import themeConfig from "../app/utils/color";
import useIsDark from "../app/utils/useIsDark";
import HomePage from "./homepage";
import { useEffect, useState } from "react";
export default function Index() {
  const router = useRouter()
  const is_Dark = useIsDark()
  const [isFirstTime,setIsFirstTime] = useState(true)
useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/profile');
      setIsFirstTime(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        backgroundColor:is_Dark?themeConfig.primaryD:themeConfig.primaryL
      }}
    >
      {/* <Text>Edit app/index.tsx to edit this screen.</Text> */}
      {isFirstTime && 
     <HomePage/>
      }
     {/* <Button title="Go to index" onPress={()=>router.push('/profile')}></Button> */}
    </View>
  );
}
export const options = {
  headerShown: false,
};
