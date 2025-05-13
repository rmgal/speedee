const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { cartItems } = req.body;
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  if (!lineItems || !lineItems.data) {
    console.warn("No line items returned from Stripe");
    return res.status(400).send("No line items");
  }


  const line_items = cartItems.map(item => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100), // in cents
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
    shipping_address_collection: {
      allowed_countries: ["US", "CA"], // adjust as needed
    },
  });

  res.json({ url: session.url });
});

module.exports = router;
