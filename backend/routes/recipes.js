const express = require("express");
const { admin } = require("../supabase");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();
router.use(requireAuth);
const categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
function validRecipe(body) {
  return body && typeof body.name === "string" && body.name.trim().length >= 1 && body.name.trim().length <= 120 &&
    categories.includes(body.category) && Number.isInteger(Number(body.prep_minutes)) && Number(body.prep_minutes) >= 0 && Number(body.prep_minutes) <= 1440 &&
    typeof body.ingredients === "string" && body.ingredients.trim().length >= 1 && body.ingredients.length <= 5000 &&
    (body.instructions === undefined || typeof body.instructions === "string") && (body.instructions || "").length <= 5000;
}
router.get("/", async (req, res, next) => {
  try { const { data, error } = await admin.from("recipes").select("*").eq("user_id", req.user.id).order("created_at", { ascending: false }); if (error) throw error; res.json({ recipes: data }); }
  catch (e) { next(e); }
});
router.post("/", async (req, res, next) => {
  try { if (!validRecipe(req.body)) return res.status(400).json({ error: "Check the recipe name, category, prep time, ingredients, and instructions." });
    const payload = { user_id: req.user.id, name: req.body.name.trim(), category: req.body.category, prep_minutes: Number(req.body.prep_minutes), ingredients: req.body.ingredients.trim(), instructions: (req.body.instructions || "").trim() };
    const { data, error } = await admin.from("recipes").insert(payload).select().single(); if (error) throw error; res.status(201).json({ recipe: data });
  } catch (e) { next(e); }
});
router.put("/:id", async (req, res, next) => {
  try { if (!validRecipe(req.body)) return res.status(400).json({ error: "Check the recipe details and try again." });
    const payload = { name: req.body.name.trim(), category: req.body.category, prep_minutes: Number(req.body.prep_minutes), ingredients: req.body.ingredients.trim(), instructions: (req.body.instructions || "").trim() };
    const { data, error } = await admin.from("recipes").update(payload).eq("id", req.params.id).eq("user_id", req.user.id).select().maybeSingle(); if (error) throw error; if (!data) return res.status(404).json({ error: "Recipe not found." }); res.json({ recipe: data });
  } catch (e) { next(e); }
});
router.delete("/:id", async (req, res, next) => {
  try { const { data, error } = await admin.from("recipes").delete().eq("id", req.params.id).eq("user_id", req.user.id).select("id"); if (error) throw error; if (!data.length) return res.status(404).json({ error: "Recipe not found." }); res.json({ success: true }); }
  catch (e) { next(e); }
});
module.exports = router;
