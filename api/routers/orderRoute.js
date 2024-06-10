import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  gettingRequest,
  gettingRequestForBusiness,
  gettingRequestForCustomer,
  orderRequestStatus,
  sendingRequest,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/sendRequest/:_id", verifyToken, sendingRequest);
router.put("/orderStatus/:_id", verifyToken, orderRequestStatus);
router.get("/getOrderDetail/:_id", verifyToken, gettingRequest);
router.get("/getOrderDetailBusiness", verifyToken, gettingRequestForBusiness);
router.get("/getOrderDetailCustomer", verifyToken, gettingRequestForCustomer);


export default router;
