const express = require("express");
const { admin } = require("../supabase");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();
router.use(requireAuth);
const validDate = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0,10) === s;
const meals = ["Breakfast","Lunch","Dinner","Snack"];
router.get("/", async (req,res,next) => { try { const {data,error}=await admin.from("meal_plans").select("*, recipes(id,name,category)").eq("user_id",req.user.id).order("plan_date");if(error)throw error;res.json({plans:data});}catch(e){next(e);} });
router.post("/", async (req,res,next) => {
 try {
  const {plan_date,meal_type,recipe_id}=req.body||{};
  if(!validDate(plan_date)||!meals.includes(meal_type)||!(recipe_id===null||typeof recipe_id==="string"))return res.status(400).json({error:"Choose a valid date, meal type, and recipe."});
  if(recipe_id===null){const {error}=await admin.from("meal_plans").delete().eq("user_id",req.user.id).eq("plan_date",plan_date).eq("meal_type",meal_type);if(error)throw error;return res.json({success:true,deleted:true});}
  const {data:recipe,error:recipeError}=await admin.from("recipes").select("id").eq("id",recipe_id).eq("user_id",req.user.id).maybeSingle();if(recipeError)throw recipeError;if(!recipe)return res.status(400).json({error:"That recipe does not belong to your account."});
  const {data,error}=await admin.from("meal_plans").upsert({user_id:req.user.id,plan_date,meal_type,recipe_id},{onConflict:"user_id,plan_date,meal_type"}).select().single();if(error)throw error;res.status(200).json({plan:data});
 }catch(e){next(e);}
});
router.delete("/", async(req,res,next)=>{try{const week=req.query.week;if(!validDate(week))return res.status(400).json({error:"Provide a valid week start date."});const end=new Date(`${week}T00:00:00Z`);end.setUTCDate(end.getUTCDate()+7);const endDate=end.toISOString().slice(0,10);const {error}=await admin.from("meal_plans").delete().eq("user_id",req.user.id).gte("plan_date",week).lt("plan_date",endDate);if(error)throw error;res.json({success:true});}catch(e){next(e);}});
module.exports=router;
