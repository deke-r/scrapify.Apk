const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Ensure proper asset handling
config.resolver.assetExts.push('db', 'sqlite');

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = withNativeWind(config, { 
  input: './app/globals.css',
  // Ensure proper CSS processing
  inlineRem: 16,
});