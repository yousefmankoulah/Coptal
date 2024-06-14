import express from "express";
import {
  signup,
  signin,
  signout,
  updateUser,
  signinGoogle,
  getCoachProfile,
  sendPasswordResetEmailforCoach,
  updatePassword,
} from "../controllers/authController.js";
import { verifyToken } from "../utils/verifyUser.js";

import {
  getNotifications,
  NotificationRead,
} from "../controllers/notificationController.js";


const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.put("/updateUser/:_id", verifyToken, updateUser);
router.post("/google", signinGoogle);
router.get("/coachProfile/:_id", getCoachProfile);


router.get("/notify", verifyToken, getNotifications);

router.put("/notifyRead/:_id/", verifyToken, NotificationRead);

//forget password
router.post("/forgetPasswordCoach", sendPasswordResetEmailforCoach);
router.put("/updatePassword", updatePassword);



export default router;
