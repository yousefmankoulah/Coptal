import { Button, Badge, Rating, Table , Card } from "flowbite-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix the default icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function BusinessDetail() {
  const [formData, setFormData] = useState({});
  const { currentUser, token } = useSelector((state) => state.user);

  const { id } = useParams();

  useEffect(() => {
    const handleSubmit = async () => {
  
      try {
      
        const res = await fetch(
          `${import.meta.env.VITE_DOMAIN}/api/business/getABusiness/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
  
        if (!res.ok) {
          console.log(data.message);
          return;
        }
  
        setFormData(data);
      } catch (error) {
        console.log("Something went wrong");
      }
    };

    handleSubmit()
  }, [])


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


  console.log(formData)

  return (
    <div className="min-h-screen mt-20">
      <Card className="lg:w-3/4 xs:w-full mx-auto shadow-2xl rounded-2xl">
      <div className="h-36 lg:h-auto lg:w-48 flex-none bg-cover text-center overflow-hidden sm:w-36 xs:w-36 mx-auto" mt-10>
            <img 
              src={formData.businessLogo} 
              alt={`${formData.businessName} company logo`} 
              className="w-full h-full object-cover rounded-full"
             />
        </div>

        <h1 className="font-bold text-center text-3xl uppercase mt-10 mb-1">{formData.businessName} Profile</h1>
        <div className="text-center mx-auto">
            {formData.businessTotalRating && formData.businessTotalRating > 0 ? (
                <Rating>
              <RatingStars rating={formData.businessTotalRating} />
                </Rating>
                ) : (
                  <p>No reviews yet</p>
                )}
        </div>
        <p className="text-center mb-10 font-mono">Local <b>{formData.businessCategory}</b> in your area</p>

                {formData.businessServices && formData.businessServices.length > 0 && (
        <div className="overflow-x-auto lg:w-3/4 xs:w-full sm:w-3/4 mx-auto shadow-xl rounded-xl">
      <Table>
        <Table.Head>
          <Table.HeadCell>Service name</Table.HeadCell>
          <Table.HeadCell>Minimum Price</Table.HeadCell>
          <Table.HeadCell>Maximum Price</Table.HeadCell>

        </Table.Head>
        <Table.Body className="divide-y">
          {formData.businessServices.map((business) => (
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {business.serviceName}
            </Table.Cell>
            <Table.Cell>{business.minPrice}</Table.Cell>
            <Table.Cell>{business.maxPrice}</Table.Cell>
           
          </Table.Row>
          ))}

        </Table.Body>
      </Table>
    </div>
    )}

        <div className="mt-10 mb-5">
          <span className="text-blue-950 text-left">{formData.businessDescription}</span>
        </div>

        
        <div className="justify-center items-center p-4 rounded-2xl">
          
          {formData.servingArea && formData.servingArea.location && (
            <>
            <p className="text-center text-xl mt-6 mb-2 font-bold">Serving Area in {formData.servingArea.zipCode}</p>
            <MapContainer
              center={[formData.servingArea.location.coordinates[1], formData.servingArea.location.coordinates[0]]}
              zoom={8}
              scrollWheelZoom={true}
              className="h-96 w-full lg:w-1/2"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[formData.servingArea.location.coordinates[1], formData.servingArea.location.coordinates[0]]} />
              <Circle
                center={[formData.servingArea.location.coordinates[1], formData.servingArea.location.coordinates[0]]}
                radius={formData.servingArea.rangeInMiles * 1609.34} // Convert miles to meters
              />
            </MapContainer>
            </>
          )}
        </div>

        <div className="mx-auto w-4/5 mt-10 mb-10">
        
        {currentUser ? (
          <>
          {formData.userId === currentUser._id ? (
             <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-2">
            <Button className="mx-auto w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg" color="success">Update the Business</Button>
            <Button className="mx-auto bg-red-700 text-white w-full sm:w-1/2 sm:w-auto px-6 py-2 text-lg" color="red">Delete the Business</Button>
          </div>
          ): (
            <>
            <Button className="mx-auto" color="success">Request Access</Button>
            </>
          )}
          </>
        ): (
          <>
          <Button className="mx-auto" color="success">Request Access</Button>
          </>
        )}
        
        </div>
       
      </Card>
    </div>
  )
}
