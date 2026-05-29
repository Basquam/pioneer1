import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="premise" />
      <Stack.Screen name="theme" />
      <Stack.Screen name="saga" />
      <Stack.Screen name="compass" />
      <Stack.Screen name="intro" />
    </Stack>
  );
}
