import { errorHandler } from "../utils/error.js";
import { Business } from "../models/businessModel.js";
import { User } from "../models/userModel.js";
import { OrderRequest } from "../models/orderModels.js";

export const sendingRequest = async (req, res, next) => {
  const customerId = req.user.id;
  try {
    
    const {
      zipcode,
      phoneNumber,
      offerPrice,
      serviceDescription,
      service,
      serviceDate,
    } = req.body;

    if(!zipcode || !phoneNumber || !service || !offerPrice){
      return res.status(404).json({ message: "Please fill out all the forms" });
    }

    const customer = await User.findById(customerId);
   
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
   
    const business = await Business.findById(req.params._id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.userId.toString() === customerId) {
      return res.status(404).json({ message: "You can't create a request for yourself" });
    }

    const saveOrderRequest = new OrderRequest({
      userId: business.userId.toString(),
      businessId: req.params._id,
      customerId: customerId,
      serviceDate,
      service,
      serviceDescription,
      zipcode,
      phoneNumber,
      offerPrice,
    });
    await saveOrderRequest.save();
    res.status(201).json({ message: "Order request sent successfully" });
  } catch (err) {
    next(errorHandler(res, err));
    console.log(err)
  }
};

export const orderRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderRequestId = req.params._id;
    const orderRequest = await OrderRequest.findById(orderRequestId);
    if (!orderRequest) {
      return res.status(404).json({ message: "Order request not found" });
    }

    if (orderRequest.userId !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to update this order request",
        });
    }
    if (orderRequest.status === "Canceled") {
      return res
        .status(400)
        .json({ message: "Order request already rejected" });
    }
    if (orderRequest.status === "Accepted") {
      return res
        .status(400)
        .json({ message: "Order request already accepted" });
    }
    if (status === true) {
      orderRequest.status = "Accepted";
    } else {
      orderRequest.status = "Canceled";
    }
    await orderRequest.save();
    res
      .status(200)
      .json({ message: "Order request status updated successfully" });
  } catch (err) {
    next(errorHandler(res, err));
  }
};
