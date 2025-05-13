// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Product = require("./models/Product");
const app = express();

app.use(cors({
  origin: "https://speedee-fe.vercel.app", 
  methods: ["GET", "POST"],
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB connection error:", err));

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

// Raw body parser for Stripe webhook
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

const checkoutRoutes = require("./routes/checkout");
app.use("/api/stripe", require("./routes/webhook"));
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", require("./routes/orders"));






