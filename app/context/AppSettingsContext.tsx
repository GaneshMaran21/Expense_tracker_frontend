import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { getSecureItem, setSecureItem } from '../utils/storageUtils'

type ThemeMode = 'light' | 'dark' | 'system'
type TextSize = 'small' | 'medium' | 'large'

interface AppSettingsContextType {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => Promise<void>
  isDark: boolean
  textSize: TextSize
  setTextSize: (size: TextSize) => Promise<void>
  reducedMotion: boolean
  setReducedMotion: (value: boolean) => Promise<void>
  boldText: boolean
  setBoldText: (value: boolean) => Promise<void>
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')
  const [textSize, setTextSizeState] = useState<TextSize>('medium')
  const [reducedMotion, setReducedMotionState] = useState(false)
  const [boldText, setBoldTextState] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await getSecureItem('theme_mode')
        const savedTextSize = await getSecureItem('text_size')
        const savedReducedMotion = await getSecureItem('reduced_motion')
        const savedBoldText = await getSecureItem('bold_text')
        
        if (savedTheme) setThemeModeState(savedTheme as ThemeMode)
        if (savedTextSize) setTextSizeState(savedTextSize as TextSize)
        if (savedReducedMotion === 'true') setReducedMotionState(true)
        if (savedBoldText === 'true') setBoldTextState(true)
      } catch (error) {
        console.error('Error loading preferences:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadPreferences()
  }, [])
  
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)
    await setSecureItem('theme_mode', mode)
  }
  
  const setTextSize = async (size: TextSize) => {
    setTextSizeState(size)
    await setSecureItem('text_size', size)
  }
  
  const setReducedMotion = async (value: boolean) => {
    setReducedMotionState(value)
    await setSecureItem('reduced_motion', value.toString())
  }
  
  const setBoldText = async (value: boolean) => {
    setBoldTextState(value)
    await setSecureItem('bold_text', value.toString())
  }
  
  const isDark = 
    themeMode === 'dark' 
      ? true 
      : themeMode === 'light' 
      ? false 
      : systemColorScheme === 'dark'
  
  return (
    <AppSettingsContext.Provider value={{
      themeMode,
      setThemeMode,
      isDark,
      textSize,
      setTextSize,
      reducedMotion,
      setReducedMotion,
      boldText,
      setBoldText,
    }}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext)
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider')
  }
  return context
}

