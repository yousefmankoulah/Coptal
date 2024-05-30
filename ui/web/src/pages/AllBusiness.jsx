import { Card, Button, Modal, Timeline } from "flowbite-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";


import { HiOutlineExclamationCircle, HiCalendar } from "react-icons/hi";

export default function AllBusiness() {
    const [formData, setFormData] = useState({})
    const { currentUser, token } = useSelector((state) => state.user);

    useEffect(() => {
        const getAllBusiness = async () => {

            try {
                
                  const res = await fetch(
                    `${import.meta.env.VITE_DOMAIN}/api/business/getAllBusiness`,
                    
                  );
                  const data = await res.json();
                  if (res.ok) {
                    setFormData(data);
                  } else {
                    console.error("Error fetching customers:", data.message);
                  }
              } catch (error) {
                console.log(error.message);
              }
        }
        getAllBusiness()
      }, []);
     

    return (
    <div className="min-h-screen mt-20">

<div className="container mx-auto p-4">
      {formData && formData.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {formData.map((business) => (
            <div key={business._id}>
              <Card
                className="max-w-sm"
                imgAlt={`${business.businessName} company logo`}
                imgSrc={business.businessLogo}
              >
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {business.businessName}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  {business.businessDescription}
                </p>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
        
    </div>
    );
  }
  