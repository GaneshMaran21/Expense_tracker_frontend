import React, { useState, useEffect } from 'react'
import { Pressable, Text, View, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { deleteSecureItem, getSecureItem } from '../utils/storageUtils'
import { useRouter } from 'expo-router'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import * as Haptics from 'expo-haptics'

const LogOut = () => {
  const router = useRouter()
  const theme = useTheme() // Reactive theme hook
  const isDark = useIsDark()
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = await getSecureItem('user_name')
        if (user) {
          setUserName(user)
        }
      } catch (error) {
        console.error('Error fetching username:', error)
      }
    }
    fetchUserName()
  }, [])
  
  const handleLogOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            
            try {
              const acc = await getSecureItem('accessToken')
              const user = await getSecureItem('user_name')
              console.log(acc, user, "token")
              
              await deleteSecureItem('accessToken')
              await deleteSecureItem('refreshToken')
              await deleteSecureItem('user_name')
              
              // Navigate to profile/onboarding after logout
              router.push('/profile')
            } catch (error) {
              console.error('Logout error:', error)
              Alert.alert('Error', 'Failed to logout. Please try again.')
            } finally {
              setIsLoading(false)
            }
          }
        }
      ],
      { cancelable: true }
    )
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Icon Container */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: theme.errorText + '20' }
        ]}>
          <Ionicons
            name="log-out"
            size={64}
            color={theme.errorText}
          />
        </View>
        
        {/* User Name Display */}
        {userName && (
          <View style={[
            styles.userContainer,
            { backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC' }
          ]}>
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={theme.appPrimary}
              style={{ marginRight: 12 }}
            />
            <Text style={[styles.userNameText, { color: theme.textPrimary }]}>
              {userName}
            </Text>
          </View>
        )}
        
        {/* Title and Description */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Logout
        </Text>
        <Text style={[styles.description, { color: theme.textPrimary + 'CC' }]}>
          Are you sure you want to sign out?{'\n'}
          You'll need to sign in again to access your account.
        </Text>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
            style={({ pressed }) => [
              styles.cancelButton,
              {
                backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
                opacity: pressed ? 0.7 : 1,
              }
            ]}
          >
            <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>
              Cancel
            </Text>
          </Pressable>
          
          <Pressable
            onPress={handleLogOut}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.logoutButton,
              {
                backgroundColor: theme.errorText,
                opacity: pressed || isLoading ? 0.7 : 1,
              }
            ]}
          >
            <View style={styles.logoutButtonContent}>
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.primarylight} style={{ marginRight: 8 }} />
              ) : (
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={theme.primarylight}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={[styles.logoutButtonText, { color: theme.primarylight }]}>
                {isLoading ? 'Logging out...' : 'Logout'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LogOut

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    minWidth: 200,
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 20,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})