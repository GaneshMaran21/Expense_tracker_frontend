import { Stack, usePathname } from "expo-router";
import useIsDark from "./utils/useIsDark";
import { Provider } from "react-redux";
import { store } from "./redux/store/store";
import { View } from "react-native";
import Footer from "@/component/Footer";

export default function RootLayout() {
  const isDark = useIsDark();               // ✅ always runs
  const pathName = usePathname();           // ✅ always runs

  // footer should be hidden on certain paths
  const hideFooterOn = [ "/screen/login_page", "/screen/signUpPage","/profile","/index",'screen/homePage','/'];
  const shouldShowFooter = !hideFooterOn.includes(pathName);
  console.log(pathName,"pathName")

  return (
    <Provider store={store}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#6200ee" },
            headerTintColor: "#fff",
            headerTitleAlign: "center",
          }}
        >
          <Stack.Screen name="profile" options={{ headerShown: false, title: "My Profile" }} />
          <Stack.Screen name="index" options={{ headerShown: false, title: "Index" }} />
          <Stack.Screen name="screen/login_page" options={{ headerShown: false, title: "login" }} />
          <Stack.Screen name="screen/signUpPage" options={{ headerShown: true, title: "Sign Up" }} />
          <Stack.Screen name="screen/logOut" options={{ headerShown: true, title: "Log Out" }} />
          <Stack.Screen name="screen/HomePage" options={{headerShown:true,title:"Home",animation:"fade"}}/>
          <Stack.Screen name="screen/ListPage" options={{headerShown:true,title:"List",animation:"fade"}}/>
          <Stack.Screen name="screen/MainPage" options={{headerShown:true,title:"Main",animation:"fade"}}/>
          <Stack.Screen name="screen/notification" options={{headerShown:true,title:"notify",animation:"fade"}}/>
          <Stack.Screen name="screen/settings" options={{headerShown:true,title:"settings",animation:"fade"}}/>
        </Stack>

        {shouldShowFooter && 
        <View style={{
          paddingHorizontal:20,
        
        }}>

        <Footer />
        </View>}   {/* ✅ stable conditional */}
      </View>
    </Provider>
  );
}