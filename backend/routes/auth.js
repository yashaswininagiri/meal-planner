const express = require("express");
const { publicClient } = require("../supabase");
const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== "string" || password.length < 6 || password.length > 128) {
      return res.status(400).json({ error: "Enter a valid email and a password between 6 and 128 characters." });
    }
    const { data, error } = await publicClient.auth.signUp({ email: email.trim().toLowerCase(), password });
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ session: data.session, user: data.user });
  } catch (error) { next(error); }
});
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) return res.status(400).json({ error: "Email and password are required." });
    const { data, error } = await publicClient.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return res.status(401).json({ error: "Email or password is incorrect." });
    res.json({ session: data.session, user: data.user });
  } catch (error) { next(error); }
});
module.exports = router;
