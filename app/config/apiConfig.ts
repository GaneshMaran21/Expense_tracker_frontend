/**
 * API Configuration
 * 
 * This file manages API endpoints for different environments.
 * 
 * For AWS deployment with HTTPS:
 * 1. Set up SSL certificate on AWS (using ALB, CloudFront, or nginx)
 * 2. Change USE_HTTPS to true
 * 3. Update BACKEND_URL with your HTTPS domain or IP
 */

// Environment Configuration
// Set to 'production' to always use production endpoint
// Set to 'auto' to use production in release builds, local in dev
const ENVIRONMENT = 'local' as 'production' | 'local' | 'auto';

// HTTPS Configuration
// Set to true if your backend supports HTTPS
export const USE_HTTPS = false; // Change to true when HTTPS is configured

// Backend URL Configuration
const PROTOCOL = USE_HTTPS ? 'https' : 'http';
const BACKEND_HOST = '43.204.140.81';
const BACKEND_PORT = '2222';

// Local development URL (for testing)
const LOCAL_DEV_URL = 'http://172.20.10.2:2222';

// Production/Staging URL
const PRODUCTION_URL = USE_HTTPS 
  ? `${PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}` // HTTPS with port
  : `${PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}`; // HTTP with port

// Select the appropriate URL based on environment setting
// Note: For production builds (release APK/IPA), always use production URL
const IS_PRODUCTION_BUILD = __DEV__ === false;

// Determine which URL to use
let selectedUrl: string;

if (ENVIRONMENT === 'production') {
  // Force production URL regardless of build type
  selectedUrl = PRODUCTION_URL;
} else if (ENVIRONMENT === 'local') {
  // Force local URL (only use in development/testing)
  selectedUrl = LOCAL_DEV_URL;
} else { // 'auto' - automatically detect based on build type
  selectedUrl = IS_PRODUCTION_BUILD ? PRODUCTION_URL : LOCAL_DEV_URL;
}

// Final URL: In production builds, always use production URL (safety check)
export const API_BASE_URL = IS_PRODUCTION_BUILD ? PRODUCTION_URL : selectedUrl;

// Export for debugging
export const API_CONFIG = {
  environment: ENVIRONMENT,
  protocol: PROTOCOL,
  host: BACKEND_HOST,
  port: BACKEND_PORT,
  useHttps: USE_HTTPS,
  baseUrl: API_BASE_URL,
  isProductionBuild: IS_PRODUCTION_BUILD,
  productionUrl: PRODUCTION_URL,
  localUrl: LOCAL_DEV_URL,
};

console.log('🔧 API Configuration:', API_CONFIG);

