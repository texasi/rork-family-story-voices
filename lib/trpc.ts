import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (envUrl && envUrl.length > 0) return envUrl;

  const extra = (Constants?.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  const extraUrl = extra["EXPO_PUBLIC_RORK_API_BASE_URL"];
  if (extraUrl && extraUrl.length > 0) return extraUrl;

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  throw new Error("No base url found. Set EXPO_PUBLIC_RORK_API_BASE_URL or run on web.");
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
