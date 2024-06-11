import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Alert, Modal, Button } from "flowbite-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm  from '../components/CheckoutForm.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB_KEY);



export default function RequestDetail() {
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);
    const { currentUser, token } = useSelector((state) => state.user);
    const [status, setStatus] = useState(null);
    const { id } = useParams();
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState('');

    

    useEffect(() => {
      const fetchClientSecret = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_DOMAIN}/api/order/payment/${id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error("Error fetching client secret:", error);
        }
      };
  
      fetchClientSecret();
    }, [id, token]);


    useEffect(() => {
        const getRequestInfo = async () => {
            try{
                const res = await fetch(
                    `${import.meta.env.VITE_DOMAIN}/api/order/getOrderDetail/${id}`,
                    {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  const data = await res.json();
            
                  if (!res.ok) {
                    setPublishError(data.message);
                    return;
                  }
                  setFormData(data)
            } catch(err) {
                setPublishError(error);
            }
        }

        getRequestInfo()
      }, [formData.status, formData.paid]);
    
      const handleStatusUpdate = async (newStatus) => {
        setStatus(newStatus);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_DOMAIN}/api/order/orderStatus/${id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: newStatus }),
            }
          );
          const data = await response.json();
          if (!response.ok) {
            setPublishError(data.message);
          }
          if (newStatus === "Canceled"){
            navigate(`/dashboard/${currentUser._id}`);
          } else if (newStatus === "Accepted") {
            setShowModal(true)
          }
          
          
        } catch (error) {
          setPublishError(error)
        }
      };


  return (
    <Card className="mt-20 lg:w-3/4 sm:w-full xs:w-full mx-auto shadow-2xl rounded-2xl mb-10">
    <h1 className="text-2xl text-center font-bold mt-10 mb-10 uppercase">
      {formData.service}
    </h1>
  
    <div className="flex flex-wrap justify-between gap-5">
      {formData.businessId && (
        <Card className="lg:w-[48%] md:w-full sm:w-full shadow-2xl rounded-2xl mb-10 bg-white border border-gray-200">
          <h4 className="font-bold text-2xl text-center mb-5 mt-5 text-gray-700">
            Business Information
          </h4>
          <div className="flex flex-col items-center">
            <img
              className="w-36 h-36 rounded-full mb-5 shadow-lg"
              src={formData.businessId.businessLogo}
              alt="Business Logo"
            />
            <span className="text-lg font-semibold text-gray-600">
              Business Name: {formData.businessId.businessName}
            </span>
            <span className="text-lg font-semibold text-gray-600">
              Business Category: {formData.businessId.businessCategory}
            </span>
            <span className="text-lg font-semibold text-gray-600">
              Working Range: {formData.businessId.servingArea.rangeInMiles} Miles
            </span>
          </div>
        </Card>
      )}
  
      <Card className="lg:w-[48%] md:w-full sm:w-full shadow-2xl rounded-2xl mb-10 bg-white border border-gray-200">
        <h4 className="font-bold text-2xl text-center mb-5 mt-5 text-gray-700">
          Order Detail
        </h4>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-gray-600">
            Service Name: {formData.service}
          </span>
          <span className="text-lg font-semibold text-gray-600">
            Service Date: {formData.serviceDate}
          </span>
          <span className="text-lg font-semibold text-gray-600">
            Service Description: {formData.serviceDescription}
          </span>
          <span className="text-lg font-semibold text-gray-600">
            Zipcode: {formData.zipcode}
          </span>
          <span className="text-lg font-semibold text-gray-600">
            Offer Price: ${formData.offerPrice}
          </span>
        </div>
      </Card>
    </div>
  
    {formData.status === "Accepted" && formData.paid === true ? (
      <Card className="w-full shadow-2xl rounded-2xl mb-10 p-5">
        <h4 className="font-bold text-2xl text-center mb-5 mt-5">
          Customer Phone Number
        </h4>
        <div className="flex flex-col items-center">
          <a
            href={`tel:${formData.phoneNumber}`}
            className="text-3xl font-bold mt-5 mb-5 text-white p-5 rounded-3xl transition duration-300 bg-blue-800"
          >
            Call the Customer
          </a>
        </div>
      </Card>
    ) : (
      formData.status === "Pending" && (
        <form className="text-center">
          <p className="text-gray-700 mt-5">Order is still pending...</p>
          <p className="text-gray-700 mt-5">
            To get the customer phone number, you have to accept and pay for this request
          </p>
          <h5 className="font-bold text-2xl mt-10 mb-10">Accept or Refuse the order</h5>
          <div className="flex justify-center items-center space-x-10">
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-green-500 flex justify-center items-center text-white text-2xl"
              onClick={() => handleStatusUpdate("Accepted")}
            >
              <i className="fas fa-check"></i>
            </button>
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-red-500 flex justify-center items-center text-white text-2xl"
              onClick={() => handleStatusUpdate("Canceled")}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </form>
      )
    )}

    {formData.status === "Accepted" && formData.paid === false && (
        <>
          <Button onClick={() => setShowModal(true)} color="success" className="mx-auto mt-5 mb-5">Pay 5$ for the Info</Button>
        </>
    )}

    <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
          <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
            Coptal
          </span>
            <h3 className="mb-5 font-bold text-lg text-gray-500 dark:text-gray-400">
              Pay 5$ to get the customer Phone number.
            </h3>
            
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm id={id} />
              </Elements>
            )}
          </div>
        </Modal.Body>
      </Modal>

  
    {publishError && (
      <Alert className="mt-5" color="failure">
        {publishError}
      </Alert>
    )}
  </Card>
  )
}
