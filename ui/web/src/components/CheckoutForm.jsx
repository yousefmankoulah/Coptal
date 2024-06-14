import React, { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { Alert, Spinner } from "flowbite-react";

export default function CheckoutForm({ id }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");

    const fetchClientSecret = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_DOMAIN}/api/order/orderRequestPayment/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        await response.json();
      } catch (error) {
        console.error("Error fetching client secret:", error);
      }
    };

    const checkPaymentStatus = async () => {
      if (!clientSecret) return;

      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        switch (paymentIntent.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            console.log("success");
            await fetchClientSecret();
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setMessage("An error occurred while checking payment status.");
      }
    };

    checkPaymentStatus();
   
  }, [stripe, id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `https://shiny-tribble-gj69pq4wv66cvxwq-5173.app.github.dev/RequestDetail/${id}`,
        },
      });
      
      if (error) {
        setMessage(error.message);
        setIsLoading(false);
        return;
      }

    } catch (error) {
      console.error("Error confirming payment:", error);
      setMessage("An error occurred while confirming payment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mx-auto mt-5 mb-5 bg-green-700 p-5 rounded-2xl text-white font-bold text-2xl">
        <span id="button-text">
          {isLoading ? (<div className="flex items-center">
                <Spinner />
                <span className="ml-2">Loading...</span>
              </div>) : "Pay $5"}
        </span>
      </button>
      {message && <Alert className="mt-5" color="success" id="payment-message">{message}</Alert>}
    </form>
  );
}
