import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="new-story" options={{ presentation: "modal" }} />
      <Stack.Screen name="player/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="invite-voice" options={{ presentation: "modal" }} />
      <Stack.Screen name="consent" options={{ presentation: "modal" }} />
      <Stack.Screen name="auth" options={{ presentation: "modal" }} />
      <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SubscriptionProvider>
            <FamilyProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </FamilyProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
