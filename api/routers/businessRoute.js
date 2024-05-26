import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addBusiness,
  deleteBusiness,
  getABusiness,
  getAllBusiness,
  getBusinessesByLocation,
  updateBusiness,
} from "../controllers/businessController.js";
import {
  addRating,
  deleteComment,
  getAReview,
  getBusinessReview,
  updateComment,
} from "../controllers/ratingController.js";

const router = express.Router();

//business routes
router.post("/addBusiness/:_id", verifyToken, addBusiness);
router.put("/updateBusiness/:_id", verifyToken, updateBusiness);
router.delete("/deleteBusiness/:_id", verifyToken, deleteBusiness);
router.get("/getABusiness/:_id", getABusiness);
router.get("/getAllBusiness", getAllBusiness);
router.get("/search", getBusinessesByLocation);

//rating routes

router.post("/addRating/:_id", verifyToken, addRating);
router.put("/updateComment/:_id", verifyToken, updateComment);
router.delete("/deleteComment/:_id", verifyToken, deleteComment);
router.get("/getAReview/:_id", getAReview);
router.get("getBusinessReview/:businessId", getBusinessReview);

export default router;
