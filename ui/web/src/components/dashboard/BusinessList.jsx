import { Button, Badge, Rating } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";


export default function BusinessList() {
    const { currentUser, token } = useSelector((state) => state.user);
    const [businessList, setBusinessList] = useState([]);

    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
  
    useEffect(() => {
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
              // Handle unauthorized access or other errors
              console.error("Error fetching business:", data.message);
            }
          }
        } catch (error) {
          console.log(error.message);
        }
      };
  
      fetchBusinessList();
    }, [currentUser]);
  
   
    useEffect(() => {
        setFilteredCustomers(
            businessList.filter((customer) => {
              const searchQueryLower = searchQuery.toLowerCase();
        
              const matchesBusinessName = customer.businessName
                ?.toLowerCase()
                .includes(searchQueryLower);
              const matchesBusinessCategory = customer.businessCategory
                ?.toLowerCase()
                .includes(searchQueryLower);
              const matchesBusinessDescription = customer.businessDescription
                ?.toLowerCase()
                .includes(searchQueryLower);
              
              // Check if any of the business services match the search query
              const matchesServiceName = customer.businessServices?.some((service) =>
                service.serviceName?.toLowerCase().includes(searchQueryLower)
              );
        
              return (
                matchesBusinessName ||
                matchesBusinessCategory ||
                matchesBusinessDescription ||
                matchesServiceName
              );
            })
          );
    }, [businessList, searchQuery]);

    const renderStars = (rating) => {
        const filledStars = Math.floor(rating);
        const remainingStars = 5 - filledStars;
        const stars = [];
    
        for (let i = 0; i < filledStars; i++) {
          stars.push(<Rating.Star key={`filled-${i}`} />);
        }
    
        for (let i = 0; i < remainingStars; i++) {
          stars.push(<Rating.Star key={`empty-${i}`} filled={false} />);
        }
    
        return stars;
      };
    
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
      <div className="container mr-auto ml-auto md:mx-auto p-3">
        <div className="mb-2 mt-4 lg:w-2/3 md:w-3/4 mx-auto text-black">
          <input
            type="text"
            placeholder="Search by Customer Name, Phone, or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-1/4 rounded-xl"
          />
        </div>
  
        {businessList.length > 0 ? (
          <div className="flex flex-col gap-4 lg:w-2/3 md:w-3/4 mx-auto mt-10">
             
            {filteredCustomers.map((business, index) => (
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
                  <h5 className="text-2xl font-bold tracking-tight text-blue-950 dark:text-blue-950 uppercase text-center">
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

                  {currentUser && (
          <>
          {business.userId === currentUser._id && (
             <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-2 mx-auto">
            <Button className="w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg" color="success"><Link to={`/updateBusiness/${business._id}`}>Update the Business</Link></Button>
            <Button type="button" color="blue" className="w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg">
                <Link to={`/businessDetail/${business._id}`}>View Detail</Link>
              </Button>
          </div>
          )}
          </>
        )}
                 
                </div>
              </div>
            ))}
          </div>
        ): (
            <p>There are no Businesses Created</p>
        )}
           
    
      </div>
    );
}
