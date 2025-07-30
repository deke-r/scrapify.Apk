import { Stack } from "expo-router";
import './globals.css';

export default function RootLayout() {
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
            headerTitleStyle: { color: '#2E7D32' },
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
            headerTitleStyle: { color: '#2E7D32' },
            headerTintColor: '#2E7D32',
          }}
        />


    </Stack>
  );
}
