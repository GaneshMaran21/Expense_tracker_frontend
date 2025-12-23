import { useColorScheme } from "react-native";
import { useAppSettings } from "../context/AppSettingsContext";

const useIsDark = () => {
  try {
    // Try to use context first (if available)
    const { isDark } = useAppSettings();
    return isDark;
  } catch {
    // Fallback to system theme if context not available
    const systemColorScheme = useColorScheme();
    return systemColorScheme === "dark";
  }
}

export default useIsDark

