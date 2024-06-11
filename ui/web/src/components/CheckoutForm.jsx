import React, { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { Alert } from "flowbite-react";

export default function CheckoutForm({id}) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, token } = useSelector((state) => state.user);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");

    if (!clientSecret) {
      return;
    }

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

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          fetchClientSecret()
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
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `https://shiny-tribble-gj69pq4wv66cvxwq-5173.app.github.dev/RequestDetail/${id}`, 
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mx-auto mt-5 mb-5 bg-green-700 p-5 rounded-2xl text-white font-bold text-2xl">
        <span id="button-text">
          {isLoading ? <div className="spinner text-white" id="spinner"></div> : "Pay $5"}
        </span>
      </button>
      {message && <Alert className="mt-5" color="success" id="payment-message">{message}</Alert>}
    </form>
  );
}
