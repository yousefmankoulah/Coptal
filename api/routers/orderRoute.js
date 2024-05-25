import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  orderRequestStatus,
  sendingRequest,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/sendRequest", verifyToken, sendingRequest);
router.post("/orderStatus/:_id", verifyToken, orderRequestStatus);

export default router;
