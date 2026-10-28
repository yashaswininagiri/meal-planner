const { publicClient } = require("../supabase");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Please log in to continue." });
  if (!publicClient) return res.status(503).json({ error: "Authentication is not configured on the server." });
  try {
    const { data, error } = await publicClient.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "Your session is invalid or expired. Please log in again." });
    req.user = data.user;
    next();
  } catch {
    return res.status(401).json({ error: "Could not verify your session." });
  }
}
module.exports = { requireAuth };
