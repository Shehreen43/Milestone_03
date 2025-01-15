"use server";

import { imageUrl } from "@/lib/imageUrl";
import stripe from "@/lib/stripe"; 
import { BasketItem } from "@/store/store";
import * as z from "zod";
import Stripe from "stripe"; 

// // Load environment variables from .env.local
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
// // Create Sanity client
// const client = createClient({
//   projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
//   dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
//   useCdn: false,
//   token: process.env.SANITY_API_TOKEN,
//   apiVersion: '2021-08-31'
// })

export type Metadata = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
};

export type GroupedBasketItem = {
  product: BasketItem["product"];
  quantity: number;
};

// Metadata schema for validation
const MetadataSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  clerkUserId: z.string(),
});

function constructUrl(path: string): string {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `https://${process.env.VERCEL_URL || "your-production-domain.com"}`
      : process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

  if (!baseUrl.startsWith("http")) {
    throw new Error(`Invalid base URL: ${baseUrl}`);
  }

  return `${baseUrl}${path}`;
}

function validateBasket(items: GroupedBasketItem[]): void {
  const itemWithoutPrice = items.filter((item) => !item.product.price);
  if (itemWithoutPrice.length > 0) {
    throw new Error(
      `Some items do not have a price: ${itemWithoutPrice
        .map((item) => item.product.name || "Unnamed Product")
        .join(", ")}`
    );
  }

  const invalidQuantities = items.filter((item) => item.quantity <= 0);
  if (invalidQuantities.length > 0) {
    throw new Error(
      `Invalid quantities for items: ${invalidQuantities
        .map((item) => item.product.name || "Unnamed Product")
        .join(", ")}`
    );
  }
}

function mapLineItems(items: GroupedBasketItem[]): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    price_data: {
      currency: "gbp",
      unit_amount: Math.round(item.product.price! * 100),
      product_data: {
        name: item.product.name || "Unnamed Product",
        description: `Product ID: ${item.product._id}`,
        metadata: { id: item.product._id },
        images: item.product.image
          ? [imageUrl(item.product.image).url()]
          : undefined,
      },
    },
    quantity: item.quantity,
  }));
}

export async function createCheckoutSession(
  items: GroupedBasketItem[],
  metadata: Metadata
) {
  try {
    const validatedMetadata = MetadataSchema.parse(metadata);
    // const validatedMetadata = metadata
    validateBasket(items);

    let customerId: string | undefined;
    if (validatedMetadata.customerEmail) {
      const customers = await stripe.customers.list({
        email: validatedMetadata.customerEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
   
      customer: customerId,
      customer_creation: customerId ? undefined : "always",
      customer_email: !customerId ? validatedMetadata.customerEmail : undefined,
      metadata: validatedMetadata,
      mode: "payment",
      allow_promotion_codes: true,
      success_url: constructUrl(
        `/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${validatedMetadata.orderNumber}`
      ),
      cancel_url: constructUrl("/basket"),
      line_items: mapLineItems(items),      
      };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return session.url;

  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}


// // "use server";

// // import { imageUrl } from "@/lib/imageUrl";
// // import stripe from "@/lib/stripe";
// // import { BasketItem } from "@/store/store";

// // export type Metadata = {
// //   orderNumber: string;
// //   customerName: string;
// //   customerEmail: string;
// //   clerkUserId: string;
// // };

// // export type GroupedBasketItem = {
// //   product: BasketItem["product"];
// //   quantity: number; // Ensure quantity is a number
// // };


// // function constructUrl(path: string): string {
// //   const baseUrl =
// //     process.env.NODE_ENV === "production"
// //       ? `https://${process.env.VERCEL_URL || "your-production-domain.com"}`
// //       : process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

// //   if (!baseUrl.startsWith("http")) {
// //     throw new Error(`Invalid base URL: ${baseUrl}`);
// //   }

// //   return `${baseUrl}${path}`;
// // }

// // export async function createCheckoutSession(
// //   items: GroupedBasketItem[],
// //   metadata: Metadata
// // ) {
// //   try {
// //     // Check if any grouped item doesn't have a price
// //     const itemWithoutPrice = items.filter((item) => !item.product.price);
// //     if (itemWithoutPrice.length > 0) {
// //       throw new Error("Some items do not have a price");
// //     }

// //     // Search for existing customer by email
// //     const customers = await stripe.customers.list({
// //       email: metadata.customerEmail,
// //       limit: 1,
// //     });

// //     let customerId: string | undefined;
// //     if (customers.data.length > 0) {
// //       customerId = customers.data[0].id;
// //     }

// //     // Create a checkout session
// //     const session = await stripe.checkout.sessions.create({
// //       customer: customerId,
// //       customer_creation: customerId ? undefined : "always",
// //       customer_email: !customerId ? metadata.customerEmail : undefined,
// //       metadata,
// //       mode: "payment",
// //       allow_promotion_codes: true,
// //       success_url: constructUrl(`/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`),
// //       cancel_url: constructUrl("/basket"), 
// //       line_items: items.map((item) => ({
// //         price_data: {
// //           currency: "gbp",
// //           unit_amount: Math.round(item.product.price! * 100), // Ensure price is multiplied by 100
// //           product_data: {
// //             name: item.product.name || "Unnamed Product",
// //             description: `Product ID: ${item.product._id}`,
// //             metadata: {
// //               id: item.product._id,
// //             },
// //             images: item.product.image
// //               ? [imageUrl(item.product.image).url()]
// //               : undefined,
// //           },
// //         },
// //         quantity: item.quantity,
// //       })),
// //     });
// // console.log(session);

// //     return session.url; 
// //   } catch (error) {
// //     console.error("Error creating checkout session:", error);
// //     throw error;
// //   }
// // }
