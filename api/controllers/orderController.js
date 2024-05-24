import { errorHandler } from "../utils/error.js";
import { Business } from "../models/businessModel.js";
import { User } from "../models/userModel.js";
import { OrderRequest } from "../models/orderModels.js";

export const sendingRequest = async (req, res, next) => {
  try {
    const {
      zipcode,
      phoneNumber,
      offerPrice,
      serviceDescription,
      service,
      serviceDate,
    } = req.body;
    customerId = req.user.id;
    const customer = await User.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const business = await Business.findById(req.params._id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    const businessService = business.businessServices.find(
      (s) => s.serviceName === serviceName
    );
    if (!businessService) {
      return res
        .status(404)
        .json({ message: "Service not found in this business" });
    }

    // Check if the offer price is too low
    if (offerPrice < businessService.minPrice) {
      return res.status(400).json({ message: "Offer price is too low" });
    }

    const saveOrderRequest = new OrderRequest({
      userId: business.userId,
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
  }
};
