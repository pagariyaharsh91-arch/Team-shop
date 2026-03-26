import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import importUpload from "./importupload.js";
import authRoutes from "./authRoutes.js";
import orderRoutes from "./orderRoutes.js";
import productRoutes from "./productRoutes.js";
import shopAuthRoutes from "./shopAuthRoutes.js";

dotenv.config();

const app = express();

/* ===== CORS ===== */
app.use(cors({ origin: "*" }));

/* ===== Body Parser ===== */
app.use(express.json());

/* ===== Mongo ===== */
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Shop")
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB error:", err.message));

/* ===== Upload API ===== */
app.use("/api/import", importUpload);

/* ===== User Auth API ===== */
app.use("/api/auth", authRoutes);

/* ===== Shop Auth API ===== */
app.use("/api/shop-auth", shopAuthRoutes);

/* ===== Orders API ===== */
app.use("/api/orders", orderRoutes);

/* ===== Products API ===== */
app.use("/api/products", productRoutes);

/* ===== Health Check ===== */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});