import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addBusiness,
  deleteBusiness,
  getABusiness,
  getBusinessesByLocation,
  updateBusiness,
  checkBusinessName,
  checkBusinessNameForUpdate,
  getBusinessForOwner
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
router.get("/getBusinessForOwner", verifyToken, getBusinessForOwner);
router.get("/getABusiness/:_id", getABusiness);
router.get("/search", getBusinessesByLocation);
router.post("/checkBusinessName", checkBusinessName)
router.post("/checkBusinessNameForUpdate/:_id", checkBusinessNameForUpdate)


//rating routes

router.post("/addRating/:_id", verifyToken, addRating);
router.put("/updateComment/:_id", verifyToken, updateComment);
router.delete("/deleteComment/:_id", verifyToken, deleteComment);
router.get("/getAReview/:_id", getAReview);
router.get("/getBusinessReview/:businessId", getBusinessReview);

export default router;
