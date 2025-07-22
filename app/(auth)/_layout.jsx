import { Stack } from "expo-router";
import '../globals.css';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='signup' options={{ headerShown: false }} />
    </Stack>
  );
}
