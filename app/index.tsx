import { useRouter } from "expo-router";
import { View } from "react-native";
import { useTheme } from "../app/utils/color";
import { useEffect } from "react";
import { getSecureItem } from "./utils/storageUtils";

export default function Index() {
  const theme = useTheme()
  const router = useRouter()

  async function getItemFromStorage(key: string) {
    return await getSecureItem(key)
  }

  useEffect(() => {
    // Check token after splash screen finishes (2.5 seconds)
    // This allows the animated splash to complete before navigation
    const timer = setTimeout(async () => {
      try {
        const item = await getItemFromStorage("accessToken");
        const user_name = await getItemFromStorage('user_name')
        if (item && user_name) {
          console.log("Token and user found  :", item, user_name);
          router.push('/screen/HomePage')
        } else {
          console.log("No token found. Sign in or sign up");
          router.push("/profile");
        }
      } catch (error) {
        console.error("Error checking token:", error);
        router.push("/profile");
      }
    }, 2500); // Wait for splash screen to finish (2.5 seconds)

    // Cleanup if component unmounts before timeout
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background
      }}
    >
      {/* Empty view - splash screen is handled in _layout.tsx */}
    </View>
  );
}
export const options = {
  headerShown: false,
};
