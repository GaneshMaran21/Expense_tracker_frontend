import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/app/utils/color'
import { useRouter, usePathname } from 'expo-router'
import useIsDark from '@/app/utils/useIsDark'
// Uncomment when expo-blur is installed: npm install expo-blur
// import { BlurView } from 'expo-blur'

// Gradient component using layered Views to simulate gradient
// Install expo-linear-gradient for true gradient: npm install expo-linear-gradient
const GradientView = ({ colors, style, children }: { colors: string[], style: any, children: React.ReactNode }) => {
  return (
    <View style={[style, { overflow: 'hidden' }]}>
      {/* Gradient simulation using multiple layers */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[0], opacity: 0.8 }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[1], opacity: 0.6 }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[2], opacity: 0.4 }]} />
      <View style={{ zIndex: 1 }}>
        {children}
      </View>
    </View>
  )
}


const Footer = () => {
  const route = useRouter()
  const pathname = usePathname()
  const theme = useTheme() // Reactive theme hook
  const isDark = useIsDark() // Get dark mode state
  
  // Define routes for each icon
  const routes = {
    home: '/screen/HomePage',
    calendar: '/screen/ListPage',
    add: '/screen/MainPage',
    notification: '/screen/notification',
    settings: '/screen/settings'
  }
  
  // Check if a route is active
  const isActive = (routePath: string) => pathname === routePath
  
  // Gradient colors for active tab (theme-based)
  const gradientColors = [theme.appPrimary, theme.appPrimary + 'CC', theme.appPrimary + '99']
  
  // Theme-based glassmorphism colors
  const glassBackground = isDark 
    ? theme.primaryDark + 'CC' // Dark mode: use primaryDark with opacity
    : theme.primary + 'E6' // Light mode: use primary (white) with opacity
  const borderColor = isDark 
    ? theme.primarylight + '30' // Dark mode: white border with opacity
    : theme.textPrimary + '40' // Light mode: dark border with more opacity for visibility
  const shadowColor = isDark ? '#000' : '#00000040' // Theme-based shadow
  
  return (
    <View style={styles.footerContainer}>
      {/* Glassmorphism container with blur effect */}
      <View
        style={[
          styles.footer,
          {
            // Glassmorphism effect: theme-based semi-transparent background
            backgroundColor: glassBackground,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            borderBottomLeftRadius: 25, // Rounded bottom corners
            borderBottomRightRadius: 25, // Rounded bottom corners
            borderTopWidth: 1,
            borderTopColor: borderColor, // Theme-based top border
            borderBottomWidth: 1,
            borderBottomColor: borderColor, // Theme-based bottom border (visible in light mode)
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderLeftColor: borderColor,
            borderRightColor: borderColor,
            // Theme-based shadow for depth
            shadowColor: shadowColor,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.5 : 0.3,
            shadowRadius: 16,
            elevation: 20,
            overflow: 'hidden',
          }
        ]}
      >
        {/* Optional: Add BlurView here when expo-blur is installed for true blur effect */}
        {/* <BlurView intensity={80} style={StyleSheet.absoluteFill} /> */}
        {/* Home Icon */}
        <Pressable 
          onPress={() => route.push(routes.home as any)}
          style={styles.iconContainer}
        >
          {isActive(routes.home) ? (
            <GradientView
              colors={gradientColors}
              style={styles.iconWrapper}
            >
              <Ionicons name="home" size={24} color={theme.primarylight} />
            </GradientView>
          ) : (
            <View style={styles.iconWrapper}>
              <Ionicons name="home-outline" size={24} color={theme.textPrimary} />
            </View>
          )}
        </Pressable>
        
        {/* Calendar Icon */}
        <Pressable 
          onPress={() => route.push(routes.calendar as any)}
          style={styles.iconContainer}
        >
          {isActive(routes.calendar) ? (
            <GradientView
              colors={gradientColors}
              style={styles.iconWrapper}
            >
              <Ionicons name="calendar" size={24} color={theme.primarylight} />
            </GradientView>
          ) : (
            <View style={styles.iconWrapper}>
              <Ionicons name="calendar-outline" size={24} color={theme.textPrimary} />
            </View>
          )}
        </Pressable>
        
        {/* Add/Plus Icon */}
        <Pressable 
          onPress={() => route.push(routes.add as any)}
          style={styles.iconContainer}
        >
          {isActive(routes.add) ? (
            <GradientView
              colors={gradientColors}
              style={styles.iconWrapper}
            >
              <Ionicons name="add" size={28} color={theme.primarylight} />
            </GradientView>
          ) : (
            <View style={styles.iconWrapper}>
              <Ionicons name="add-outline" size={28} color={theme.textPrimary} />
            </View>
          )}
        </Pressable>
        
        {/* Notification Icon */}
        <Pressable 
          onPress={() => route.push(routes.notification as any)}
          style={styles.iconContainer}
        >
          {isActive(routes.notification) ? (
            <GradientView
              colors={gradientColors}
              style={styles.iconWrapper}
            >
              <Ionicons name="notifications" size={24} color={theme.primarylight} />
            </GradientView>
          ) : (
            <View style={styles.iconWrapper}>
              <Ionicons name="notifications-outline" size={24} color={theme.textPrimary} />
            </View>
          )}
        </Pressable>
        
        {/* Settings Icon */}
        <Pressable 
          onPress={() => route.push(routes.settings as any)}
          style={styles.iconContainer}
        >
          {isActive(routes.settings) ? (
            <GradientView
              colors={gradientColors}
              style={styles.iconWrapper}
            >
              <Ionicons name="settings" size={24} color={theme.primarylight} />
            </GradientView>
          ) : (
            <View style={styles.iconWrapper}>
              <Ionicons name="settings-outline" size={24} color={theme.textPrimary} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  )
}

export default Footer

export const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 20, // Adjusted position from bottom
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    paddingHorizontal: 16, // Horizontal padding on every screen
  },
  footer: {
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
})  