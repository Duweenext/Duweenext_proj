// app/layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../srcs/auth/context/auth_context';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';

function InnerLayout() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();                // e.g. ['auth', 'welcome'] or ['tabs', 'education']

  if (isLoading) {
    // you could return a splash screen here
    return null;
  }

  const onAuthRoute = segments[0] === 'auth';    // adjust if you use (auth) group

  if (!session && !onAuthRoute) {
    // no session → go to welcome/login
    router.replace('/auth/welcome');
    return null;
  }

  if (session && onAuthRoute) {
    // already logged in → skip auth routes
    router.replace('/');
    return null;
  }

  // otherwise, render whatever segment you’re on
  return <Slot />;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    "roboto-condensed-regular": require("../assets/fonts/Roboto_Condensed/RobotoCondensed-Regular.ttf"),
    "roboto-condensed-medium": require("../assets/fonts/Roboto_Condensed/RobotoCondensed-Medium.ttf"),
    "roboto-condensed-semibold": require("../assets/fonts/Roboto_Condensed/RobotoCondensed-SemiBold.ttf"),
    "roboto-condensed-bold": require("../assets/fonts/Roboto_Condensed/RobotoCondensed-Bold.ttf"),
  });
  if (!loaded) return null;

  return (
    <PaperProvider>
      <AuthProvider>
        <InnerLayout />
      </AuthProvider>
    </PaperProvider>
  );
}
