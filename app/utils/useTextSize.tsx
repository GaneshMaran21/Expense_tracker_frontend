import { useAppSettings } from '../context/AppSettingsContext'

export const useTextSize = () => {
  try {
    const { textSize, boldText } = useAppSettings()
    
    const getFontSize = (baseSize: number) => {
      switch (textSize) {
        case 'small':
          return baseSize * 0.9
        case 'medium':
          return baseSize
        case 'large':
          return baseSize * 1.2
        default:
          return baseSize
      }
    }
    
    const getFontWeight = (): '400' | '700' => {
      return boldText ? '700' : '400'
    }
    
    return {
      textSize,
      boldText,
      getFontSize,
      getFontWeight,
      fontSizeMultiplier: textSize === 'small' ? 0.9 : textSize === 'medium' ? 1 : 1.2,
    }
  } catch {
    // Fallback if context not available
    return {
      textSize: 'medium' as const,
      boldText: false,
      getFontSize: (baseSize: number) => baseSize,
      getFontWeight: () => '400',
      fontSizeMultiplier: 1,
    }
  }
}

export default useTextSize

