import useIsDark from "./useIsDark"

const _isDark = useIsDark()

const themeConfig = {
    primary:_isDark?"#0e1b26":"#FFFFFF",     
    textPrimary: _isDark?"#FFFFFF": "#0e1b26", //primary
     primarylight:"#FFFFFF",
     primaryDark:"#0e1b26",
    primaryButtonl:"#2044f9",
    appPrimary:"#1d41f9",
    inputBox:"#752bc9",
    errorContainer:"#ffd7d7",
    errorText:"#ef4e4e"
}

export default themeConfig