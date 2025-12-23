/**
 * Navigation utility for handling redirects
 * Uses callback pattern for Expo Router navigation
 */

import * as SecureStore from 'expo-secure-store';

// Global callback for navigation (set by _layout.tsx)
let navigateToProfileCallback: (() => void) | null = null;

export const setNavigateToProfileCallback = (callback: (() => void) | null) => {
  navigateToProfileCallback = callback;
};

/**
 * Redirect to profile screen when unauthorized
 * Clears tokens and calls navigation callback
 */
export const redirectToProfile = async () => {
  try {
    // Clear tokens
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user_name');
    
    // Call navigation callback if set (don't await - fire and forget for immediate redirect)
    if (navigateToProfileCallback) {
      // Use setTimeout to ensure redirect happens after current execution
      setTimeout(() => {
        navigateToProfileCallback?.();
      }, 0);
    }
  } catch (error) {
    console.error('Error redirecting to profile:', error);
  }
};

/**
 * Check if error requires login and redirect if needed
 */
export const handleUnauthorizedError = async (error: any): Promise<boolean> => {
  // Check if error indicates login is required
  if (error?.status === 401 || error?.data?.requiresLogin || error?.data?.status === 401) {
    await redirectToProfile();
    return true; // Indicates redirect happened
  }
  return false; // No redirect needed
};

