import { Card } from "flowbite-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import RequestService from "../components/dashboard/RequestService.jsx";
import BusinessList from "../components/dashboard/BusinessList.jsx";



export default function Dashboard() {
  const [selectedCard, setSelectedCard] = useState(null);
  const { currentUser, token } = useSelector((state) => state.user);
  const [businessList, setBusinessList] = useState([]);
  const [requestService, setRequestService] = useState([]);


  useEffect(() => {
    
    const fetchRequestService = async () => {
      try {
       
          const url = currentUser.role === "business" ? `${import.meta.env.VITE_DOMAIN}/api/order/getOrderDetailBusiness` : `${import.meta.env.VITE_DOMAIN}/api/order/getOrderDetailCustomer`;
          const res = await fetch(url,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (res.ok) {
            setRequestService(data);
          } else {
            // Handle unauthorized access or other errors
            console.error("Error fetching Requests:", data.message);
          }
        
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchBusinessList = async () => {
      try {
        if (currentUser && currentUser._id) {
          const res = await fetch(
            `${import.meta.env.VITE_DOMAIN}/api/business/getBusinessForOwner`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (res.ok) {
            setBusinessList(data);
          } else {
            console.error("Error fetching Business:", data.message);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };

  
    fetchRequestService();
    fetchBusinessList();
    
  }, [currentUser]);

  const handleCardClick = (cardName) => {
    setSelectedCard(cardName);
  };

  return (
    <div className="min-h-screen mt-20">
      
          <h1 className="text-3xl font-bold text-center mb-20">
            Welcome to the Dashboard
          </h1>
          {currentUser ? (
            <>
              <div className="grid grid-flow-col grid-rows-2 sm:grid-rows-2 md:grid-rows-2 lg:grid-rows-1 xl:grid-rows-1 h-90 gap-2 justify-center">
                <Card className="" onClick={() => handleCardClick("request")}>
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Number of Requests
                  </h5>
                  <p className="font-normal text-gray-700 dark:text-gray-400">
                    You got{" "}
                    {requestService && requestService.length > 0 ? (
                      <>
                        <span className="font-bold">{requestService.length}</span>{" "}
                        Request Service created
                      </>
                    ) : (
                      <>0 Request Service created</>
                    )}
                  </p>
                  
                </Card>

                <Card className="" onClick={() => handleCardClick("business")}>
                  <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                    Number of Business
                  </h5>
                  <p className="font-normal text-gray-700 dark:text-gray-400">
                    You got{" "}
                    {businessList && businessList.length > 0 ? (
                      <>
                        <span className="font-bold">{businessList.length}</span>{" "}
                        Businesses created
                      </>
                    ) : (
                      <>0 Businesses created</>
                    )}
                  </p>
                 
                </Card>

              
              </div>

              {selectedCard === null && <RequestService />}
              {selectedCard === "request" && <RequestService />}
              {selectedCard === "business" && <BusinessList />}
              
            </>
          ) : (
           <p>You have to Sign in</p>
          )}
     
    </div>
  );
}