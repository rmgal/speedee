const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Optional: fetch line items if needed
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    const order = new Order({
      email: session.customer_email,
      items: lineItems.data.map((item) => ({
        name: item.description,
        price: item.amount_total / 100,
        quantity: item.quantity,
      })),
      totalAmount: session.amount_total / 100,
      paymentStatus: session.payment_status,
      shipping: {
        name: session.shipping.name,
        address: session.shipping.address,
      },
    });

    await order.save();
  }

  res.json({ received: true });
});

module.exports = router;
