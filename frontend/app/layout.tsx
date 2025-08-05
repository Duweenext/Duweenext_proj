import { Slot } from 'expo-router';
import './globals.css';
import { AuthProvider } from '../srcs/auth/context/auth_context';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [loaded] = useFonts({
    "roboto-condensed-regular": require("../assets/fonts/Roboto_Condensed/RobotoCondensed-Regular.ttf"),
    "roboto-condensed-medium": require("../assets/fonts/Roboto_Condensed/RobotoCondensed-Medium.ttf"),
    "roboto-condensed-semibold": require("../assets/fonts/Roboto_Condensed/RobotoCondensed-SemiBold.ttf"),
  });

  if (!loaded) return null;

  return (
    <PaperProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </PaperProvider>
  );
}
