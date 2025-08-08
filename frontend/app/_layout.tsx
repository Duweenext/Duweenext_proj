// app/layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider  } from '../srcs/auth/context/auth_context';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';

// Toggle here (or use process.env.EXPO_PUBLIC_AUTH_DISABLED === 'true')
const AUTH_DISABLED = true;

function InnerLayout() {
  const router = useRouter();
  const segments = useSegments(); // e.g. ['auth', 'welcome'] or ['tabs', 'education']

  // 🔹 Skip auth entirely
  if (AUTH_DISABLED) {
    return <Slot />;
  }

  // 🔹 Normal auth flow
  // const { session, isLoading } = useAuth();

  // if (isLoading) {
  //   // Optional: return splash
  //   return null;
  // }

  const onAuthRoute = segments[0] === 'auth';

  // if (!session && !onAuthRoute) {
  //   router.replace('/auth/welcome');
  //   return null;
  // }

  // if (session && onAuthRoute) {
  //   router.replace('/');
  //   return null;
  // }

  return <Slot />;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    'roboto-condensed-regular': require('../assets/fonts/Roboto_Condensed/RobotoCondensed-Regular.ttf'),
    'roboto-condensed-medium': require('../assets/fonts/Roboto_Condensed/RobotoCondensed-Medium.ttf'),
    'roboto-condensed-semibold': require('../assets/fonts/Roboto_Condensed/RobotoCondensed-SemiBold.ttf'),
    'roboto-condensed-bold': require('../assets/fonts/Roboto_Condensed/RobotoCondensed-Bold.ttf'),
  });
  if (!loaded) return null;

  return (
    <PaperProvider>
        // No provider needed because InnerLayout won't call useAuth()
        <InnerLayout />
    </PaperProvider>
  );
}
