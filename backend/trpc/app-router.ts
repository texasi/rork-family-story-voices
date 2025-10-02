import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import createCheckoutSession from "@/backend/trpc/routes/payments/createCheckout/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  payments: createTRPCRouter({
    createCheckoutSession,
  }),
});

export type AppRouter = typeof appRouter;
