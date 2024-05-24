import express from "express";
import {
  signup,
  signin,
  signout,
  updateUser,
  signinGoogle,
  getCoachProfile,
} from "../controllers/authController.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.put("/updateUser/:_id", verifyToken, updateUser);
router.post("/google", signinGoogle);
router.get("/coachProfile/:_id", getCoachProfile);

export default router;
