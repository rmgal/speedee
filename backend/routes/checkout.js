const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { cartItems } = req.body;

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
    line_items,
    mode: "payment",
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
  });

  res.json({ url: session.url });
});

module.exports = router;
