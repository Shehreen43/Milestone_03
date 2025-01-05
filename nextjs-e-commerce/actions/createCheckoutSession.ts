 "use server";

import { BasketItem } from "@/store/store";

export type Metadata = {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    clerkUserId: string;
  };

export type GroupedBasketItem = {
    product: BasketItem["product"];
    quantity: Metadata;
};

export async function createCheckoutSession(
    items: GroupedBasketItem[],
    metadata: Metadata
) {
    try {
        //check if any grouped item dont have a price
        const itemWithoutPrice = items.filter((item) => !item.product.price);
        if (itemWithoutPrice.length > 0) {
            throw new Error("Some item do not have a price")
        }

         //Search for existing customer by email
         const customers = await stripe.customers.list({
            email: metadata.customerEmail,
            limit: 1,
         });

         let customerId: string | undefined;
         if (customers.data.length > 0) {
            customerId = customers.data[0].id;
         }
    
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_creation: customerId ? undefined : "always",
        customer_email: !customerId ? metadata.customerEmail : undefined,
        metadata,
        mode: "payment",
        allow_promotion_codes: true,
        success_url: `${`https://${process.env.VERCEL_URL}` || process.env.NEXT_PUBLIC_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}$orderNumber=${metadata.orderNumber}`,
        cancel_url: `${`https://${process.env.VERCEL_URL}` || process.env.NEXT_PUBLIC_BASE_URL}/basket`,
    
    
    })

    } catch (error) {
        console.log("Error creating checkout session");
        throw error;
    }
}