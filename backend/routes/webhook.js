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
    
    try {
      const session = event.data.object;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      if (!lineItems || !lineItems.data) {
        console.warn("No line items returned from Stripe");
        return res.status(400).send("No line items");
      }

      const order = new Order({
        email: session.customer_details.customer_email,
        items: lineItems.data.map((item) => ({
          name: item.description,
          price: item.amount_total / item.quantity / 100,
          quantity: item.quantity,
        })),
        totalAmount: session.amount_total / 100,
        paymentStatus: session.payment_status,
        shipping: session.collected_information.shipping_details
          ? {
              name: session.collected_information.shipping_details.name || "",
              address: {
                line1: session.collected_information.shipping_details.address.line1 || "",
                line2: session.collected_information.shipping_details.address.line2 || "",
                city: session.collected_information.shipping_details.address.city || "",
                state: session.collected_information.shipping_details.address.state || "",
                postal_code: session.collected_information.shipping_details.address.postal_code || "",
                country: session.collected_information.shipping_details.address.country || ""
              }
            }
          : { name: "", address: {} }
      });

      await order.save();
    }
    catch (err) {
      console.error("Error handling checkout.session.completed:", err);
      return res.status(500).send("Webhook handler error");
    }
  }

  res.json({ received: true });
});

module.exports = router;
