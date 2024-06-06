import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  gettingRequest,
  orderRequestStatus,
  sendingRequest,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/sendRequest/:_id", verifyToken, sendingRequest);
router.post("/orderStatus/:_id", verifyToken, orderRequestStatus);
router.get("/getOrderDetail/:_id", verifyToken, gettingRequest);

export default router;
