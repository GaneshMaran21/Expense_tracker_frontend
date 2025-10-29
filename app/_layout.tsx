import { Stack } from "expo-router";
import useIsDark from "./utils/useIsDark";
import { Provider } from "react-redux";
import { store } from "./redux/store/store";

export default function RootLayout() {
  const _useIsDark = useIsDark()
  return (
    <Provider store={store}>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#6200ee" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      
        <Stack.Screen
        name="profile"
        options={{ headerShown: false, title: "My Profile" }} // Show header
      />
        <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "Index" }}      // Show header
      />
        <Stack.Screen
        name="screen/login_page"
        options={{ headerShown: false, title: "login" }}      // Show header
      />
        <Stack.Screen
        name="screen/signUpPage"
        options={{ headerShown: true, title: "Sign Up" }}    // Show header
      />
        <Stack.Screen
        name="screen/logOut"
        options={{ headerShown: true, title: "Log Out" }}    // Show header
      />
      {/* Screens are automatically picked up from your file structure */}
    </Stack>
    </Provider>
  );
}