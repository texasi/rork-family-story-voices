import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export const createCheckoutSession = publicProcedure
  .input(
    z.object({
      mode: z.enum(["subscription", "payment"]).default("subscription"),
      priceId: z.string().optional(),
      lineItems: z
        .array(z.object({ price: z.string(), quantity: z.number().int().positive().default(1) }))
        .optional(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
      customerEmail: z.string().email().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error("Stripe secret key not configured");
    }

    const body = new URLSearchParams();
    body.append("mode", input.mode);
    body.append("success_url", input.successUrl);
    body.append("cancel_url", input.cancelUrl);
    if (input.customerEmail) body.append("customer_email", input.customerEmail);

    if (input.lineItems && input.lineItems.length > 0) {
      input.lineItems.forEach((li, idx) => {
        body.append(`line_items[${idx}][price]`, li.price);
        body.append(`line_items[${idx}][quantity]`, String(li.quantity));
      });
    } else if (input.priceId) {
      body.append("line_items[0][price]", input.priceId);
      body.append("line_items[0][quantity]", "1");
    } else {
      throw new Error("Provide priceId or lineItems");
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Stripe error: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as { id: string; url?: string };
    return { id: data.id, url: data.url ?? null };
  });

export default createCheckoutSession;
