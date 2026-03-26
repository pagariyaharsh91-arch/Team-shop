import express from "express";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";
import Shop from "./shop.js";
import { importXlsxToMongo } from "./importXlsx.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

function verifyShopToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  console.log("AUTH HEADER =", auth);

  if (!token) {
    return res.status(401).json({ success: false, message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED TOKEN =", decoded);
    req.shop = decoded;
    next();
  } catch (err) {
    console.log("TOKEN ERROR =", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

router.post("/upload-xlsx", verifyShopToken, upload.single("file"), async (req, res) => {
  try {
    console.log("UPLOAD ROUTE HIT");

    if (!req.file) {
      console.log("NO FILE RECEIVED");
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    console.log("UPLOADED FILE =", req.file);

    const shop = await Shop.findById(req.shop.shopId);
    console.log("FOUND SHOP =", shop);

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const result = await importXlsxToMongo(req.file.path, shop._id);
    console.log("IMPORT RESULT =", result);

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      shop: shop.name,
      recordsProcessed: result.inserted
    });
  } catch (err) {
    console.log("UPLOAD ERROR =", err);
    return res.status(500).json({
      success: false,
      message: "XLSX import failed",
      error: err.message
    });
  }
});

export default router;