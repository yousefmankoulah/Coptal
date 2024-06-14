import { errorHandler } from "../utils/error.js";
import { Business } from "../models/businessModel.js";
import { OrderRequest } from "../models/orderModels.js";
import { Notification, User } from "../models/userModel.js";
import { Stripe } from 'stripe';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  appInfo: {
    name: "Coptal",
  },
});

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

    // Validate zip code format (5-digit)
    const zipCodePattern = /^\d{5}$/;
    if (!zipCodePattern.test(zipcode)) {
      return res.status(400).json({ message: "Please enter a valid 5-digit zip code" });
    }

    // Validate phone number format (10-digit)
    const phoneNumberPattern = /^\d{10}$/;
    if (!phoneNumberPattern.test(phoneNumber)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    const currentDate = new Date();
    const selectedDate = new Date(serviceDate);
    if (selectedDate < currentDate) {
      return res.status(400).json({ message: "Service date cannot be in the past" });
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

    const coach = await User.findById(business.userId.toString())

    const notify = new Notification({
      user: business.userId.toString(),
      customer: req.user.id,
      message: `Customer ${coach.fullName} has requested ${saveOrderRequest.service} for you`,
      postId: saveOrderRequest._id,
      classification: "requestBusiness",
    });
    await notify.save();

    res.status(201).json({ message: "Order request sent successfully" });
  } catch (err) {
    next(errorHandler(res, err));
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

    if (orderRequest.userId.toString() !== req.user.id) {
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
    
    orderRequest.status = status;
   
    await orderRequest.save();


    const coach = await User.findById(req.user.id)
    if(status === "Accepted") {
      const notify = new Notification({
        user: orderRequest.customerId.toString(),
        customer: req.user.id,
        message: `Business for ${coach.fullName} has accepted your request and will call you shortly`,
        postId: orderRequest._id,
        classification: "requestCustomer",
      });
      await notify.save();
    } else if (status === "Canceled") {
      const notify = new Notification({
        user: req.user.id,
        customer: orderRequest.customerId.toString(),
        message: `Business for ${coach.fullName} has rejected your request`,
        postId: orderRequest._id,
        classification: "requestCustomer",
      });
      await notify.save();
    }
    


    res
      .status(200)
      .json({ message: "Order request status updated successfully" });
  } catch (err) {
    next(errorHandler(err));
  }
};



export const gettingRequest = async (req, res, next) => {
  try {
    const order = await OrderRequest.findById(req.params._id).populate("businessId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.userId.toString() !== req.user.id.toString() &&
      order.customerId.toString() !== req.user.id.toString()
    ) {
      return res
        .status(400)
        .json({ message: "You are not able to view this Order" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error:", error); // Log any errors
    next(errorHandler(error));
  }
};



export const gettingRequestForBusiness = async (req, res, next) => {
  try {
    const order = await OrderRequest.find({ userId: req.user.id }).populate("businessId").sort({ createdAt: -1 });
    if (!order || order.length === 0) {
      return res
        .status(400)
        .json({ message: "No orders found for this user" });
    }

    for (let orders of order) {
      if (orders.userId.toString() !== req.user.id.toString()) {
        return res
          .status(400)
          .json({ message: "You are not able to view this Order" });
      }
    }

    res.status(200).json(order);
  } catch (error) {
    next(errorHandler(error));
  }
};

export const gettingRequestForCustomer = async (req, res, next) => {
  try {
    const order = await OrderRequest.find({ customerId: req.user.id }).populate("businessId").sort({ createdAt: -1 });

    if (!order || order.length === 0) {
      return res
        .status(400)
        .json({ message: "No orders found for this user" });
    }

    for (let orders of order) {
      if (orders.customerId.toString() !== req.user.id.toString()) {
        return res
          .status(400)
          .json({ message: "You are not able to view this Order" });
      }
    }
    res.status(200).json(order);
  } catch (error) {
    next(errorHandler(error));
  }
};



export const payment = async (req, res, next) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 500,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },

    }, { apiKey: process.env.STRIPE_SECRET_KEY });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}


export const orderRequestPayment = async (req, res, next) => {
  try {
    const orderRequestId = req.params._id;
    const orderRequest = await OrderRequest.findById(orderRequestId);
    if (!orderRequest) {
      return res.status(404).json({ message: "Order request not found" });
    }

    if (orderRequest.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to update this order request",
        });
    }
    
    orderRequest.paid = true;
    await orderRequest.save();
    res
      .status(200)
      .json({ message: "Order status updated successfully" });
  } catch (err) {
    next(errorHandler(err));
  }
};