import { Button, Badge, Rating, TextInput, Label, Select, Alert, Spinner } from "flowbite-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function AllBusiness() {
  const [formData, setFormData] = useState({});
  const [businesses, setBusinesses] = useState([]);
  const [publishError, setPublishError] = useState(null);
  const { currentUser, token } = useSelector((state) => state.user);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishError(null);
    setLoading(true);

    try {
      const { zipCode, businessCategory } = formData;
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/business/search?zipCode=${zipCode}&businessCategory=${businessCategory}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.message);
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setBusinesses(data.businesses);
      setLoading(false);
    } catch (error) {
      setPublishError("Something went wrong");
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (submitted && businesses.length === 0) {
      setSubmitted(false); 
    }
  }, [formData]);


  return (
    <div className="min-h-screen mt-20">
      <div className="container mx-auto p-4">
        <h1 className="font-bold text-center text-3xl mb-10">Explore Local Businesses</h1>

        <form onSubmit={handleSubmit} className="mt-10 mx-auto lg:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
          <div className="mb-4">
            <Label value="Business Category" />
            <Select
              id="businessCategory"
              name="businessCategory"
              value={formData.businessCategory}
              onChange={handleChange}
              required
            >
              <option value="" default disabled>
                Choose your business Category
              </option>
              <option value="construction services">construction services</option>
              <option value="cleaning services">cleaning services</option>
              <option value="garage door services">garage door services</option>
              <option value="heating and air condition services">heating and air condition services</option>
              <option value="locksmith services">locksmith services</option>
              <option value="tow truck services">tow truck services</option>
              <option value="pest control services">pest control services</option>
              <option value="swimming pool maintenance">swimming pool maintenance</option>
            </Select>
          </div>

          <div className="mb-4">
            <Label value="Zip Code" />
            <TextInput
              id="zipCode"
              type="number"
              name="zipCode"
              placeholder="Your business zip code"
              onChange={handleChange}
              value={formData.zipCode}
              required
            />
          </div>
          
          <Button type="submit" color="success" className="mt-4 mx-auto" disabled={loading}>
            {loading ? (<div className="flex items-center">
                <Spinner />
                <span className="ml-2">Loading...</span>
              </div>) : ("Explore")}
          </Button>

          {publishError && (
            <Alert color="failure" className="mt-4">
              {publishError}
            </Alert>
          )}
        </form>
       
        {businesses.length > 0 ? (
          <div className="flex flex-col gap-4 lg:w-2/3 md:w-3/4 mx-auto mt-10">
            {businesses.map((business, index) => (
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
                  <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-2">

                    <Button type="button" color="success" className="w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg">
                      Request Order
                    </Button>

                    <Button type="button" color="blue" className="w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg">
                      <Link to={`/businessDetail/${business._id}`}>View Detail</Link>
                    </Button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ): (
          <>
          {submitted && (
           
            <p className="text-center mt-10 font-bold text-xl">
            No current {formData.businessCategory} in your area with zip code {formData.zipCode}
          </p>
           
          )}
          </>
            )}
           
       
      </div>
    </div>
  );
}
