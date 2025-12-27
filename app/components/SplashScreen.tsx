import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Text } from 'react-native'
import { useTheme } from '../utils/color'
import useIsDark from '../utils/useIsDark'
import { Ionicons } from '@expo/vector-icons'
import * as SplashScreen from 'expo-splash-screen'

// Keep the native splash screen visible while we load
SplashScreen.preventAutoHideAsync()

interface SplashScreenProps {
  onFinish: () => void
}

const AnimatedSplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const theme = useTheme()
  const isDark = useIsDark()
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const textFadeAnim = useRef(new Animated.Value(0)).current
  const textScaleAnim = useRef(new Animated.Value(0.8)).current
  const initialsScaleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Hide native splash screen IMMEDIATELY when component mounts
    const hideNativeSplash = async () => {
      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        console.log('Error hiding splash:', error)
      }
    }
    // Hide immediately, don't wait
    hideNativeSplash()

    // Start all animations
    Animated.parallel([
      // Main container fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Wallet icon scale and rotation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]),
      // Initials badge animation (delayed)
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(initialsScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Text animation (delayed)
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(textFadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(textScaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start()

    // Hide after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish()
      })
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  // Rotation interpolation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.primaryDark : theme.appPrimary,
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Rotating Wallet Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          <Ionicons name="wallet" size={100} color={theme.primarylight} />
        </Animated.View>

        {/* GK Initials Badge */}
        <Animated.View
          style={[
            styles.initialsContainer,
            {
              backgroundColor: theme.primarylight + '20',
              borderColor: theme.primarylight,
              transform: [{ scale: initialsScaleAnim }],
            },
          ]}
        >
          <Text style={[styles.initialsText, { color: theme.primarylight }]}>
            GK
          </Text>
        </Animated.View>

        {/* Animated Text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
              transform: [{ scale: textScaleAnim }],
            },
          ]}
        >
          <Text style={[styles.titleText, { color: theme.primarylight }]}>
            Expense Tracker
          </Text>
          <Text style={[styles.subtitleText, { color: theme.primarylight + 'CC' }]}>
            Manage your finances with ease
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  initialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  initialsText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
})

export default AnimatedSplashScreen

