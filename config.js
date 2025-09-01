import Constants from 'expo-constants';

// Configuration utility for reliable API URL access
export const getApiUrl = () => {
  console.log('🔧 Config: Starting API URL resolution...');
  
  // Method 1: Try to get from Constants.expoConfig.extra.apiUrl (works in production builds)
  if (Constants.expoConfig?.extra?.apiUrl) {
    console.log('✅ API URL found in Constants.expoConfig.extra.apiUrl:', Constants.expoConfig.extra.apiUrl);
    return Constants.expoConfig.extra.apiUrl;
  }

  // Method 2: Try to get from Constants.manifest.extra.apiUrl (fallback for older Expo versions)
  if (Constants.manifest?.extra?.apiUrl) {
    console.log('✅ API URL found in Constants.manifest.extra.apiUrl:', Constants.manifest.extra.apiUrl);
    return Constants.manifest.extra.apiUrl;
  }

  // Method 3: Try to get from process.env (works in development)
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('✅ API URL found in process.env.EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Method 4: Hardcoded fallback (last resort)
  const fallbackUrl = 'https://api.scrapify.in/api/scrapify';
  console.log('⚠️ Using hardcoded fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

// Export the API URL as a constant
export const API_URL = getApiUrl();

// Debug information
export const getConfigDebugInfo = () => {
  const debugInfo = {
    'Constants.expoConfig exists': !!Constants.expoConfig,
    'Constants.expoConfig.extra exists': !!Constants.expoConfig?.extra,
    'Constants.expoConfig.extra.apiUrl': Constants.expoConfig?.extra?.apiUrl || 'undefined',
    'Constants.manifest exists': !!Constants.manifest,
    'Constants.manifest.extra exists': !!Constants.manifest?.extra,
    'Constants.manifest.extra.apiUrl': Constants.manifest?.extra?.apiUrl || 'undefined',
    'process.env.EXPO_PUBLIC_API_URL': process.env.EXPO_PUBLIC_API_URL || 'undefined',
    'Final API_URL': API_URL,
    'Config source': getApiUrlSource(),
    'Constants.expoConfig keys': Constants.expoConfig ? Object.keys(Constants.expoConfig) : 'none',
    'Constants.expoConfig.extra keys': Constants.expoConfig?.extra ? Object.keys(Constants.expoConfig.extra) : 'none',
  };
  
  console.log('🔧 Config Debug Info:', debugInfo);
  return debugInfo;
};

// Helper to identify where the API URL came from
const getApiUrlSource = () => {
  if (Constants.expoConfig?.extra?.apiUrl) return 'Constants.expoConfig.extra.apiUrl';
  if (Constants.manifest?.extra?.apiUrl) return 'Constants.manifest.extra.apiUrl';
  if (process.env.EXPO_PUBLIC_API_URL) return 'process.env.EXPO_PUBLIC_API_URL';
  return 'Hardcoded fallback';
};

console.log('🔧 Config loaded. API_URL:', API_URL);
console.log('🔧 Config source:', getApiUrlSource());
console.log('🔧 Constants.expoConfig:', Constants.expoConfig);
console.log('🔧 Constants.manifest:', Constants.manifest); 