import useIsDark from "./useIsDark";

// Base color palette (theme-agnostic colors that don't change)
const staticColors = {
  primarylight: "#FFFFFF",
  primaryDark: "#0e1b26",
  primaryButtonl: "#2044f9",
  appPrimary: "#1d41f9",
  inputBox: "#752bc9",
  errorContainer: "#ffd7d7",
  errorText: "#ef4e4e",
};

// Function to get theme config based on dark mode
export const getThemeConfig = (isDark: boolean) => {
  return {
    primary: isDark ? "#0e1b26" : "#FFFFFF", // Pure white for components
    background: isDark ? "#0e1b26" : "#FAF8F3", // Light warm beige for page backgrounds (light mode)
    textPrimary: isDark ? "#FFFFFF" : "#0e1b26",
    primarylight: staticColors.primarylight,
    primaryDark: staticColors.primaryDark,
    primaryButtonl: staticColors.primaryButtonl,
    appPrimary: staticColors.appPrimary,
    inputBox: staticColors.inputBox,
    errorContainer: staticColors.errorContainer,
    errorText: staticColors.errorText,
  };
};

// Default export for backward compatibility
// This is static and won't react to theme changes
// For reactive theming in components, use useTheme() hook
const themeConfig = getThemeConfig(false);

export default themeConfig;

// Hook to get theme config reactively - use this in components for dynamic theming
export const useTheme = () => {
  const isDark = useIsDark();
  return getThemeConfig(isDark);
};

