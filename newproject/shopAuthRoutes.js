import express from "express";
import jwt from "jsonwebtoken";
import Shop from "./shop.js";

const router = express.Router();

/* ================= SHOP LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const shop = await Shop.findOne({ email: email.trim().toLowerCase() });

    if (!shop) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // plain password compare for now
    if (shop.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        shopId: shop._id,
        shopName: shop.name,
        email: shop.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Shop login ✅",
      token,
      shop: {
        id: shop._id,
        name: shop.name,
        email: shop.email
      }
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server error",
      error: e.message
    });
  }
});

export default router;