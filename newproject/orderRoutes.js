import express from "express";
import jwt from "jsonwebtoken";
import Order from "./order.js";
import Shop from "./shop.js";

const router = express.Router();

/* ================= USER TOKEN VERIFY ================= */

function verifyToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* ================= SHOP TOKEN VERIFY ================= */

function verifyShopToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Shop token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.shop = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid shop token" });
  }
}

/* ================= TOTAL CALCULATION ================= */

function computeTotals(items) {
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
    0
  );

  const deliveryCharge = subtotal >= 500 ? 0 : 30;
  const discount = subtotal >= 1000 ? subtotal * 0.05 : 0;
  const total = subtotal + deliveryCharge - discount;

  return { subtotal, deliveryCharge, discount, total };
}

/* ================= SAVE ORDER ================= */

router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, customerName, phone, shopName } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items missing" });
    }

    const cleanItems = items.map((it) => ({
      name: String(it.name || it.productName || "Item"),
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
    }));

    const totals = computeTotals(cleanItems);

    let targetShop = null;

    if (shopName) {
      targetShop = await Shop.findOne({ name: shopName.trim() });
    }

    if (!targetShop) {
      targetShop = await Shop.findOne({ name: "Pagariya Super Shop" });
    }

    if (!targetShop) {
      return res.status(500).json({ message: "Target shop not found" });
    }

    const order = await Order.create({
      userId: req.user.id,
      shopId: targetShop._id,
      customerName,
      phone,
      items: cleanItems,
      ...totals,
    });

    res.json({
      message: "Order saved ✅",
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Order save failed",
      error: err.message,
    });
  }
});

/* ================= GET MY ORDERS ================= */

router.get("/my", verifyToken, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
});

/* ================= ADMIN GET SHOP ORDERS ONLY ================= */

router.get("/admin", verifyShopToken, async (req, res) => {
  try {
    const orders = await Order.find({ shopId: req.shop.shopId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch shop orders",
      error: err.message,
    });
  }
});

/* ================= MARK ORDER READY ================= */

router.patch("/:id/ready", verifyShopToken, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        shopId: req.shop.shopId
      },
      { status: "ready" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found for this shop" });
    }

    const shop = await Shop.findById(req.shop.shopId);

    const shopName = shop?.name || "Your Shop";

    const message = `${shopName} 🛒

Hello ${order.customerName},
Your order is ready for pickup.
Thank you for shopping with us!`;

    const whatsappUrl =
      `https://wa.me/91${order.phone}?text=${encodeURIComponent(message)}`;

    res.json({
      message: "Order marked ready",
      whatsappUrl,
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update order",
      error: err.message,
    });
  }
});

export default router;