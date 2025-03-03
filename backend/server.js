const express = require("express");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/products", productRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));

