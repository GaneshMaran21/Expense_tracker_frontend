import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
        options={{ headerShown: false, title: "Index" }} // Show header
      />
      {/* Screens are automatically picked up from your file structure */}
    </Stack>
  );
}