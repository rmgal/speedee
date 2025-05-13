const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  email: String,
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: String,
  shipping: {
    name: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },
  },
  
});

module.exports = mongoose.model("Order", OrderSchema);
