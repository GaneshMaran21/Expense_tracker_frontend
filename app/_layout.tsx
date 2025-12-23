import { Stack, usePathname, useRouter } from "expo-router";
import { Provider } from "react-redux";
import { store } from "./redux/store/store";
import { View } from "react-native";
import Footer from "@/component/Footer";
import { useTheme } from "./utils/color";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { useEffect } from "react";
import { setNavigateToProfileCallback } from "./utils/navigationUtils";

export default function RootLayout() {
  const pathName = usePathname();
  const theme = useTheme(); // Reactive theme hook
  const router = useRouter();

  // Set navigation callback for unauthorized redirects
  useEffect(() => {
    setNavigateToProfileCallback(() => {
      router.push('/profile');
    });

    return () => {
      setNavigateToProfileCallback(null);
    };
  }, [router]);

  // footer should be hidden on certain paths (auth pages, onboarding, etc.)
  const hideFooterOn = ["/screen/login_page", "/screen/signUpPage", "/profile", "/index", "/"];
  const shouldShowFooter = !hideFooterOn.includes(pathName);

  return (
    <Provider store={store}>
      <AppSettingsProvider>
        <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack
          screenOptions={{
            headerShown: false, // Hide headers on all screens
          }}
        >
          <Stack.Screen 
            name="profile" 
            options={{
              gestureEnabled: false, // Disable swipe back gesture
              headerBackVisible: false, // Hide back button if header is shown
            }}
          />
          <Stack.Screen name="index" />
          <Stack.Screen name="screen/login_page" />
          <Stack.Screen name="screen/signUpPage" />
          <Stack.Screen name="screen/logOut" />
          <Stack.Screen name="screen/HomePage" options={{animation:"fade"}}/>
          <Stack.Screen name="screen/ListPage" options={{animation:"fade"}}/>
          <Stack.Screen name="screen/MainPage" options={{animation:"fade"}}/>
          <Stack.Screen name="screen/EditPage" options={{animation:"fade"}}/>
          <Stack.Screen name="screen/notification" options={{animation:"fade"}}/>
          <Stack.Screen name="screen/settings" options={{animation:"fade"}}/>
          <Stack.Screen name="screen/appearance" options={{animation:"fade"}}/>
        </Stack>

        {shouldShowFooter ? <Footer /> : null}
        </View>
      </AppSettingsProvider>
    </Provider>
  );
}