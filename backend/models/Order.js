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
});

module.exports = mongoose.model("Order", OrderSchema);
