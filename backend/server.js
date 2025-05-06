// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Product = require("./models/Product");
const app = express();

app.use(cors());
app.use(express.json());

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

// backend/models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Product", ProductSchema);

// frontend/src/context/CartContext.jsx
import { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

// frontend/src/pages/Products.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";

const Products = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-10">
      {products.map((product) => (
        <div key={product._id} className="p-5 border rounded">
          <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button onClick={() => addToCart(product)} className="bg-blue-500 text-white px-4 py-2 rounded">Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

export default Products;

// frontend/src/pages/Cart.jsx
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart } = useCart();

  return (
    <div>
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? <p>Your cart is empty</p> : cart.map((item, index) => (
        <div key={index}>
          {item.name} - ${item.price}
        </div>
      ))}
    </div>
  );
};

export default Cart;

// frontend/src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Products from "./pages/Products";
import Cart from "./pages/Cart";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
