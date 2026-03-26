import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./user.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email = "", password, confirmPassword } = req.body;

    if (!name || !phone || !password || !confirmPassword)
      return res.status(400).json({ message: "Required fields missing" });

    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ message: "Phone must be 10 digits" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const exists = await User.findOne({ phone }).lean();
    if (exists) return res.status(409).json({ message: "Phone already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      email: email?.trim() || "",
      passwordHash,
    });

    return res.status(201).json({
      message: "Registered ✅",
      user: { id: user._id, name: user.name, phone: user.phone, email: user.email },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // phone OR email

    if (!identifier || !password)
      return res.status(400).json({ message: "Required fields missing" });

    const user = await User.findOne({
      $or: [{ phone: identifier }, { email: identifier }],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

   const token = jwt.sign(
  { id: user._id, phone: user.phone },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);


    return res.json({
      message: "Login ✅",
      token,
      user: { id: user._id, name: user.name, phone: user.phone, email: user.email },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

export default router;
