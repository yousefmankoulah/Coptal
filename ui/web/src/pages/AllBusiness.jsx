import { Button, Badge, Rating } from "flowbite-react";
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


      const renderStars = (rating) => {
        const filledStars = Math.floor(rating); // Number of filled stars
        const remainingStars = 5 - filledStars; // Remaining empty stars
        const stars = [];
      
        // Generate filled stars
        for (let i = 0; i < filledStars; i++) {
          stars.push(<Rating.Star key={`filled-${i}`} />);
        }
      
        // Generate remaining empty stars
        for (let i = 0; i < remainingStars; i++) {
          stars.push(<Rating.Star key={`empty-${i}`} filled={false} />);
        }
      
        return stars;
      };
      
      // RatingStars component to display rating stars
      const RatingStars = ({ rating }) => (
        <div className="rating-stars">
          {rating ? (
            <div className="flex items-center">
              {renderStars(rating)}
              <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">{rating} out of 5</p>
            </div>
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      );
      
     

    return (
    <div className="min-h-screen mt-20">

<div className="container mx-auto p-4">
  {formData && formData.length > 0 && (
    <div className="flex flex-col gap-4 lg:w-2/3 md:w-3/4 mx-auto">
      {formData.map((business, index) => (
        <div 
          key={business._id} 
          className="w-full flex flex-col lg:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="h-36 lg:h-auto lg:w-48 flex-none bg-cover text-center overflow-hidden">
            <img 
              src={business.businessLogo} 
              alt={`${business.businessName} company logo`} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-between p-4 leading-normal">
            <h5 className="text-2xl font-bold tracking-tight text-blue-950 dark:text-white uppercase text-center">
              {business.businessName}
            </h5>
            <div className="text-center">
              {business.businessTotalRating && business.businessTotalRating > 0 ? (
                <Rating>
                  <RatingStars rating={business.businessTotalRating} />
                </Rating>
              ) : (
                <p>No reviews yet</p>
              )}
            </div>
            <p className="font-normal text-gray-700 dark:text-gray-400 mt-4 text-left">
              {business.businessDescription}
            </p>
            <p className="font-bold text-gray-700 dark:text-gray-400 mt-2 text-left">
              Business Zipcode: {business.servingArea.zipCode}
            </p>
            <div className="mt-4 mb-2 text-center">
              {business.businessServices && business.businessServices.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-left">
                  {business.businessServices.map((service, serviceIndex) => (
                    <Badge key={serviceIndex} color="success" className="uppercase">
                      {service.serviceName} - Price ({service.minPrice} - {service.maxPrice}$)
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-2">
              <Button type="submit" color="success" className="w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg">
                Request Order
              </Button>
              <Button type="submit" color="blue" className="w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg">
                View Detail
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        
    </div>
    );
  }
  