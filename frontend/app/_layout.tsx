import { Slot } from 'expo-router';
import './globals.css';
import { AuthProvider } from '../srcs/auth/context/auth_context';
// import { NativeWindStyleSheet } from "nativewind";

// NativeWindStyleSheet.setOutput({
//   default: "native",
// });

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
