import React from 'react'
import { Text, View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppSettings } from '../context/AppSettingsContext'
import { useTextSize } from '../utils/useTextSize'

type ThemeMode = 'light' | 'dark' | 'system'
type TextSize = 'small' | 'medium' | 'large'

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  rightComponent?: React.ReactNode
  onPress?: () => void
}

const SettingRow = ({ icon, title, subtitle, rightComponent, onPress }: SettingRowProps) => {
  const theme = useTheme()
  const isDark = useIsDark()
  
  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onPress()
        }
      }}
      style={({ pressed }) => [
        styles.settingRow,
        {
          backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
          opacity: pressed ? 0.7 : 1,
        }
      ]}
    >
      <View style={styles.settingRowContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.appPrimary + '20' }]}>
          <Ionicons name={icon} size={22} color={theme.appPrimary} />
        </View>
        <View style={styles.settingRowText}>
          <Text style={[styles.settingRowTitle, { color: theme.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingRowSubtitle, { color: theme.textPrimary + '80' }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
      </View>
    </Pressable>
  )
}

const appearance = () => {
  const theme = useTheme()
  const isDark = useIsDark()
  const router = useRouter()
  const {
    themeMode,
    setThemeMode,
    textSize,
    setTextSize,
    reducedMotion,
    setReducedMotion,
    boldText,
    setBoldText,
  } = useAppSettings()
  const { getFontSize, getFontWeight } = useTextSize()
  
  const handleThemeChange = async (mode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await setThemeMode(mode)
    // Theme will update immediately via context
  }
  
  const handleTextSizeChange = async (size: TextSize) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await setTextSize(size)
    // Text size will update immediately via context
  }
  
  const handleReducedMotionChange = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await setReducedMotion(value)
  }
  
  const handleBoldTextChange = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await setBoldText(value)
  }
  
  const getTextSizeLabel = (size: TextSize) => {
    switch (size) {
      case 'small': return 'Small'
      case 'medium': return 'Medium'
      case 'large': return 'Large'
    }
  }
  
  const getThemeModeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return 'Light'
      case 'dark': return 'Dark'
      case 'system': return 'System'
    }
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.back()
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              Appearance
            </Text>
            <View style={{ width: 40 }} />
          </View>
          
          {/* Theme Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Theme
            </Text>
            <View style={styles.sectionContent}>
              <SettingRow
                icon="sunny-outline"
                title="Light"
                subtitle="Always use light mode"
                rightComponent={
                  <Ionicons
                    name={themeMode === 'light' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={themeMode === 'light' ? theme.appPrimary : theme.textPrimary + '40'}
                  />
                }
                onPress={() => handleThemeChange('light')}
              />
              <SettingRow
                icon="moon-outline"
                title="Dark"
                subtitle="Always use dark mode"
                rightComponent={
                  <Ionicons
                    name={themeMode === 'dark' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={themeMode === 'dark' ? theme.appPrimary : theme.textPrimary + '40'}
                  />
                }
                onPress={() => handleThemeChange('dark')}
              />
              <SettingRow
                icon="phone-portrait-outline"
                title="System"
                subtitle="Follow system settings"
                rightComponent={
                  <Ionicons
                    name={themeMode === 'system' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={themeMode === 'system' ? theme.appPrimary : theme.textPrimary + '40'}
                  />
                }
                onPress={() => handleThemeChange('system')}
              />
            </View>
          </View>
          
          {/* Text Size Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Text Size
            </Text>
            <View style={styles.sectionContent}>
              <SettingRow
                icon="text-outline"
                title="Small"
                subtitle="Compact text"
                rightComponent={
                  <Ionicons
                    name={textSize === 'small' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={textSize === 'small' ? theme.appPrimary : theme.textPrimary + '40'}
                  />
                }
                onPress={() => handleTextSizeChange('small')}
              />
              <SettingRow
                icon="text-outline"
                title="Medium"
                subtitle="Default text size"
                rightComponent={
                  <Ionicons
                    name={textSize === 'medium' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={textSize === 'medium' ? theme.appPrimary : theme.textPrimary + '40'}
                  />
                }
                onPress={() => handleTextSizeChange('medium')}
              />
              <SettingRow
                icon="text-outline"
                title="Large"
                subtitle="Larger text for readability"
                rightComponent={
                  <Ionicons
                    name={textSize === 'large' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={textSize === 'large' ? theme.appPrimary : theme.textPrimary + '40'}
                  />
                }
                onPress={() => handleTextSizeChange('large')}
              />
            </View>
          </View>
          
          {/* Accessibility Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Accessibility
            </Text>
            <View style={styles.sectionContent}>
              <SettingRow
                icon="eye-outline"
                title="Bold Text"
                subtitle="Make text bolder for better readability"
                rightComponent={
                  <Switch
                    value={boldText}
                    onValueChange={handleBoldTextChange}
                    trackColor={{ false: theme.textPrimary + '30', true: theme.appPrimary + '80' }}
                    thumbColor={boldText ? theme.appPrimary : theme.textPrimary + '60'}
                  />
                }
              />
              <SettingRow
                icon="move-outline"
                title="Reduce Motion"
                subtitle="Reduce animations and transitions"
                rightComponent={
                  <Switch
                    value={reducedMotion}
                    onValueChange={handleReducedMotionChange}
                    trackColor={{ false: theme.textPrimary + '30', true: theme.appPrimary + '80' }}
                    thumbColor={reducedMotion ? theme.appPrimary : theme.textPrimary + '60'}
                  />
                }
              />
            </View>
          </View>
          
          {/* Preview Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Preview
            </Text>
            <View style={[
              styles.previewContainer,
              { backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC' }
            ]}>
              <Text style={[
                styles.previewText,
                {
                  color: theme.textPrimary,
                  fontSize: getFontSize(16),
                  fontWeight: getFontWeight() as '400' | '700',
                }
              ]}>
                This is how your text will look with the current settings.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default appearance

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionContent: {
    gap: 12,
  },
  settingRow: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingRowText: {
    flex: 1,
  },
  settingRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingRowSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  rightComponent: {
    marginLeft: 'auto',
  },
  previewContainer: {
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  previewText: {
    lineHeight: 24,
  },
})

