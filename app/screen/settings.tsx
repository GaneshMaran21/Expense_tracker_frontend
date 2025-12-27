import React from 'react'
import { Text, View, StyleSheet, Pressable, ScrollView } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import * as Haptics from 'expo-haptics'

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  onPress: () => void
  isDestructive?: boolean
}

const MenuItem = ({ icon, title, subtitle, onPress, isDestructive = false }: MenuItemProps) => {
  const theme = useTheme()
  const isDark = useIsDark()
  
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
          opacity: pressed ? 0.7 : 1,
        }
      ]}
    >
      <View style={styles.menuItemContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: isDestructive ? theme.errorText + '20' : theme.appPrimary + '20' }
        ]}>
          <Ionicons
            name={icon}
            size={24}
            color={isDestructive ? theme.errorText : theme.appPrimary}
          />
        </View>
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.menuItemSubtitle, { color: theme.textPrimary + '80' }]}>
              {subtitle}
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.textPrimary + '60'}
        />
      </View>
    </Pressable>
  )
}

const settings = () => {
  const theme = useTheme() // Reactive theme hook
  const router = useRouter()
  
  const menuItems = [
    {
      icon: 'person-outline' as const,
      title: 'Profile',
      subtitle: 'Manage your account',
      onPress: () => {
        // Navigate to profile page
        console.log('Profile pressed')
      }
    },
    {
      icon: 'wallet-outline' as const,
      title: 'Budgets',
      subtitle: 'Manage your budgets',
      onPress: () => {
        router.push('/screen/BudgetListPage')
      }
    },
    {
      icon: 'notifications-outline' as const,
      title: 'Notifications',
      subtitle: 'Manage notifications',
      onPress: () => {
        router.push('/screen/notification')
      }
    },
    {
      icon: 'color-palette-outline' as const,
      title: 'Appearance',
      subtitle: 'Theme and display settings',
      onPress: () => {
        router.push('/screen/appearance')
      }
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Privacy & Security',
      subtitle: 'Privacy settings',
      onPress: () => {
        // Navigate to privacy settings
        console.log('Privacy pressed')
      }
    },
    {
      icon: 'help-circle-outline' as const,
      title: 'Help & Support',
      subtitle: 'Get help',
      onPress: () => {
        // Navigate to help
        console.log('Help pressed')
      }
    },
    {
      icon: 'information-circle-outline' as const,
      title: 'About',
      subtitle: 'App version and info',
      onPress: () => {
        // Navigate to about
        console.log('About pressed')
      }
    },
  ]
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Settings
          </Text>
          
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={item.onPress}
              />
            ))}
          </View>
          
          <View style={styles.menuSection}>
            <MenuItem
              icon="log-out-outline"
              title="Logout"
              subtitle="Sign out of your account"
              onPress={() => {
                router.push('/screen/logOut')
              }}
              isDestructive={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default settings

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
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 30,
  },
  menuSection: {
    marginBottom: 20,
    gap: 12,
  },
  menuItem: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
})