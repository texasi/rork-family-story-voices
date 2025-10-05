import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import createCheckoutSession from "@/backend/trpc/routes/payments/createCheckout/route";
import generateAudioProcedure from "@/backend/trpc/routes/stories/generateAudio/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  payments: createTRPCRouter({
    createCheckoutSession,
  }),
  stories: createTRPCRouter({
    generateAudio: generateAudioProcedure,
  }),
});

export type AppRouter = typeof appRouter;
