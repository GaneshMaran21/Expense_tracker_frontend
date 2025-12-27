import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

/**
 * Logo Preview Component
 * This shows the design for the app logo
 * Use this as a reference to create the actual 1024x1024 PNG image
 */
const LogoPreview = () => {
  return (
    <View style={styles.container}>
      {/* Main Logo Container */}
      <View style={styles.logoContainer}>
        {/* Wallet Icon Circle Background */}
        <View style={styles.walletCircle}>
          <Ionicons name="wallet" size={60} color="#FFFFFF" />
        </View>
        
        {/* GK Initials Badge */}
        <View style={styles.initialsBadge}>
          <Text style={styles.initialsText}>GK</Text>
        </View>
        
        {/* Decorative Elements */}
        <View style={styles.decorativeRing} />
      </View>
      
      {/* App Name */}
      <Text style={styles.appName}>Expense Tracker</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1d41f9',
    padding: 40,
  },
  logoContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  walletCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1d41f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  initialsBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  initialsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d41f9',
    letterSpacing: 2,
  },
  decorativeRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: '#FFFFFF40',
  },
  appName: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
})

export default LogoPreview

