import express from "express";
import Product from "./Product.js";
import Shop from "./shop.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { shop } = req.query;

    let filter = {};

    if (shop) {
      const foundShop = await Shop.findOne({ name: shop });

      if (!foundShop) {
        return res.json([]);
      }

      filter.shopId = foundShop._id;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message
    });
  }
});

export default router;