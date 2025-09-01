# Debug Implementation for Production API Issues

## Overview
This document describes the debug implementation added to troubleshoot why the backend is still not working in APK builds despite the environment variable refactoring.

## What Was Implemented

### 1. DebugScreen Component (`DebugScreen.js`)
- **Location**: Root directory of the project
- **Purpose**: Displays API URL configuration and performs backend health check
- **Features**:
  - Shows the actual value of `Constants.expoConfig.extra.apiUrl`
  - Performs a GET request to `${apiUrl}/health` endpoint
  - Displays backend connectivity status with clear visual indicators
  - Handles various error scenarios (timeout, network errors, HTTP errors)

### 2. Integration into Forgot Password Screen
- **File**: `app/(auth)/forgot-password.jsx`
- **Location**: Below the existing form, before closing tags
- **Import**: `import DebugScreen from "../../DebugScreen";`
- **Placement**: `<DebugScreen />` component added at the end of the form

## How It Works

### API URL Display
- Extracts the API URL from `Constants.expoConfig.extra.apiUrl`
- Shows "Not found" if the value is undefined or null
- Uses monospace font for better readability of URLs

### Backend Health Check
- Automatically runs when the component mounts
- Makes a GET request to `/health` endpoint with 10-second timeout
- Provides detailed error messages for different failure scenarios:
  - ✅ API reachable (200 response)
  - ❌ API URL not found
  - ❌ API timeout
  - ❌ API error with status code
  - ❌ API not reachable (network error)
  - ❌ API check failed (other errors)

## Usage Instructions

### For Testing in Production APK
1. Build and install the APK on your device
2. Navigate to the Forgot Password screen
3. Look for the debug information below the form
4. Check the console logs for additional error details

### What to Look For
1. **API URL Value**: Verify that the correct URL is displayed
2. **Backend Status**: Check if the health check succeeds or fails
3. **Console Logs**: Look for detailed error information in the logs

## Troubleshooting Steps

### If API URL Shows "Not found"
- Check that `app.config.js` is properly configured
- Verify that `.env` file contains `EXPO_PUBLIC_API_URL`
- Ensure the build process is using `app.config.js` instead of `app.json`

### If Backend Status Shows Error
- Check network connectivity on the device
- Verify the backend server is running and accessible
- Check if the `/health` endpoint exists on your backend
- Review console logs for specific error details

### If Health Check Times Out
- Check if the backend server is responding slowly
- Verify firewall/network configurations
- Consider increasing the timeout value in the code

## Code Structure

```javascript
// DebugScreen.js - Main component
const DebugScreen = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  
  // Health check logic with error handling
  // Status display with visual indicators
}

// Integration in forgot-password.jsx
import DebugScreen from "../../DebugScreen";
// ... existing code ...
<DebugScreen />
```

## Benefits
- **Immediate Visibility**: See exactly what API URL is being used in production
- **Real-time Testing**: Verify backend connectivity directly from the app
- **Error Diagnosis**: Get specific error information for troubleshooting
- **Non-intrusive**: Doesn't affect existing functionality
- **Easy to Remove**: Can be easily removed once the issue is resolved

## Next Steps
1. Build and test the APK with this debug component
2. Check the debug information displayed on the Forgot Password screen
3. Use the information to identify the root cause of the production issue
4. Remove the debug component once the issue is resolved

## Notes
- The debug component is only visible on the Forgot Password screen
- It automatically performs health checks when the screen loads
- All error handling is done gracefully to prevent app crashes
- Console logs provide additional debugging information 