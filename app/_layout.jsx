import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import './globals.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen
          name="edit-profile"
          options={{
            title: 'Edit Profile',
            headerBackTitleVisible: false,
            tabBarStyle: { display: 'none' },
            headerBackTitle: 'Back',
            headerTitleStyle: { 
              color: '#2E7D32',
              fontFamily: 'Poppins-SemiBold',
            },
            headerTintColor: '#2E7D32',
          }}
        />
        <Stack.Screen
          name="edit-address"
          options={{
            title: 'Edit Address',
            headerBackTitleVisible: false,
            tabBarStyle: { display: 'none' },
            headerBackTitle: 'Back',
            headerTitleStyle: { 
              color: '#2E7D32',
              fontFamily: 'Poppins-SemiBold',
            },
            headerTintColor: '#2E7D32',
          }}
        />
        <Stack.Screen
          name="help-support"
          options={{
            title: 'Help & Support',
            headerBackTitleVisible: false,
            tabBarStyle: { display: 'none' },
            headerBackTitle: 'Back',
            headerTitleStyle: { 
              color: '#2E7D32',
              fontFamily: 'Poppins-SemiBold',
            },
            headerTintColor: '#2E7D32',
          }}
        />
        <Stack.Screen
          name="contact-form"
          options={{
            title: 'Contact Support',
            headerBackTitleVisible: false,
            tabBarStyle: { display: 'none' },
            headerBackTitle: 'Back',
            headerTitleStyle: { 
              color: '#2E7D32',
              fontFamily: 'Poppins-SemiBold',
            },
            headerTintColor: '#2E7D32',
          }}
        />
        <Stack.Screen
          name="book-service"
          options={{
            title: 'Book Service',
            headerBackTitleVisible: false,
            tabBarStyle: { display: 'none' },
            headerBackTitle: 'Back',
            headerTitleStyle: { 
              color: '#2E7D32',
              fontFamily: 'Poppins-SemiBold',
            },
            headerTintColor: '#2E7D32',
          }}
        />
        <Stack.Screen
          name="orders"
          options={{
            title: 'Orders',
            headerBackTitleVisible: false,
            tabBarStyle: { display: 'none' },
            headerBackTitle: 'Back',
            headerTitleStyle: { 
              color: '#2E7D32',
              fontFamily: 'Poppins-SemiBold',
            },
            headerTintColor: '#2E7D32',
          }}
        />
    </Stack>
  );
}
