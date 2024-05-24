import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addBusiness,
  deleteBusiness,
  getABusiness,
  getAllBusiness,
  updateBusiness,
} from "../controllers/businessController.js";

const router = express.Router();

//business routes
router.post("/addBusiness/:_id", verifyToken, addBusiness);
router.put("/updateBusiness/:_id", verifyToken, updateBusiness);
router.delete("/deleteBusiness/:_id", verifyToken, deleteBusiness);
router.get("/getABusiness/:_id", getABusiness);
router.get("/getAllBusiness/:businessCategory", getAllBusiness);

//rating routes
export default router;
