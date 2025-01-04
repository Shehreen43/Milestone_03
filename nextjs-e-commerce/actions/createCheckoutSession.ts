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
    } catch (error) {
        console.log("Error creating checkout session");
        throw error;
    }
}