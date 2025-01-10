import stripe from "@/lib/stripe";
import backendClient from "@/sanity/lib/backendClient"; // Ensure this points to your Sanity client
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
import { Metadata } from "@/actions/createCheckoutSession";


export async function POST(req: NextRequest) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.log("Stripe webhook secret is not set");
    return NextResponse.json(
      { error: "Stripe webhook secret is not set" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: `Webhook Error: ${error}` },
      { status: 400 }
    );
  }


  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const order = await createOrderInSanity(session);
      console.log("Order created in Sanity:", order);
    } catch (error) {
      console.error("Error creating order in Sanity:", error);
      return NextResponse.json(
        { error: "Error creating order" },
        { status: 500 }
      );
    }
  }
console.log("Webhook received:", event.type);

  return NextResponse.json({ received: true });
}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    customer,
    total_details,
  } = session;

  if (!metadata) {
    throw new Error("Metadata is missing in the session.");
  }

  const { orderNumber, customerName, customerEmail, clerkUserId } = metadata as Metadata;

  // Fetch line items with expanded product details
  const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(id, {
    expand: ["data.price.product"],
  });

  if (!lineItemsWithProduct.data.length) {
    console.warn("No line items found for session:", id);
    throw new Error("Line items are missing in the session.");
  }

  // Debugging: Log line items to verify structure
  console.log("Line items with product details:", lineItemsWithProduct.data);

  // Map line items to products for the order
  const sanityProducts = lineItemsWithProduct.data.map((item) => {
    const product = item.price?.product as Stripe.Product;
    if (!product?.metadata?.id) {
      console.warn("Product metadata ID is missing for item:", item);
      throw new Error("Product metadata ID is missing.");
    }

    return {
      _key: crypto.randomUUID(),
      product: {
        _type: "reference",
        _ref: product.metadata.id, // Ensure this matches a valid Sanity document ID
      },
      quantity: item.quantity || 0,
    };
  });

  if (!sanityProducts.length) {
    throw new Error("Sanity products array is empty. Check Stripe product metadata.");
  }

  // Create the order in your backend (Sanity)
  const order = await backendClient.create({
    _type: "order",
    orderNumber,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: payment_intent,
    customerName,
    stripeCustomerId: customer,
    clerkUserId,
    email: customerEmail,
    currency,
    amountDiscount: total_details?.amount_discount
      ? total_details.amount_discount / 100
      : 0,
    products: sanityProducts,
    totalPrice: amount_total ? amount_total / 100 : 0,
    status: "paid",
    orderDate: new Date().toISOString(),
  });

  console.log("Created order in Sanity:", order);
  return order;
}