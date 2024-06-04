import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Label,
  TextInput,
  Button,
  Textarea,
  Card,
} from "flowbite-react";



export default function RequestAccess({id}) {
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);
    const [publishSuccess, setPublishSuccess] = useState(null);
    const { currentUser, token } = useSelector((state) => state.user);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
      };

      const handleSubmit = async () => {
        setPublishError(null);
        setPublishSuccess(null)
        try {
          if (!currentUser) {
            console.error("User not authenticated");
            return;
          }
    
          const res = await fetch(
            `${import.meta.env.VITE_DOMAIN}/api/order/sendRequest/${id}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            }
          );
          const data = await res.json();
    
          if (!res.ok) {
            setPublishError(data.message);
            return;
          }
          setPublishSuccess("Request Sent Successfully")
          navigate(`/`);

        } catch (error) {
          setPublishError("Something went wrong");
        }
      };

  return (
    <Card className="mx-auto my-auto w-3/4 rounded-2xl shadow-2xl">
        <h2>Request Order</h2>
        <form onSubmit={handleSubmit} className="mt-10">
            <Label value="The service Name" />
            <TextInput 
                id="service"
                type="text"
                name="service"
                placeholder="The service needed"
                onChange={handleChange}
                value={formData.service}
                
            />
            <Label value="The service Date" />
            <TextInput 
                id="serviceDate"
                type="date"
                name="serviceDate"
                placeholder="The service Date"
                onChange={handleChange}
                value={formData.serviceDate}
                
            />
            <Label value="The service Description" />
            <Textarea
                id="serviceDescription"
                name="serviceDescription"
                placeholder="The service Description"
                onChange={handleChange}
                value={formData.serviceDescription}
                className="h-48"
            />
            <Label value="The service Zipcode" />
            <TextInput 
                id="zipcode"
                type="number"
                name="zipcode"
                placeholder="The service Zipcode"
                onChange={handleChange}
                value={formData.zipcode}
            />
            <Label value="Your phone Number" />
            <TextInput 
                id="phoneNumber"
                type="number"
                name="phoneNumber"
                placeholder="Your phone Number"
                onChange={handleChange}
                value={formData.phoneNumber}
            />
            <Label value="The service offer Price" />
            <TextInput 
                id="offerPrice"
                type="number"
                name="offerPrice"
                placeholder="The service offer Price"
                onChange={handleChange}
                value={formData.offerPrice}
            />

            <Button type="submit" className="mx-auto" color="success">Submit Request</Button>
            {publishError && (
          <Alert color="failure" className="mt-4 mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
            {publishError}
            </Alert>
             )}
            {publishSuccess && (
          <Alert color="success" className="mt-4 mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
            {publishSuccess}
          </Alert>
        )}
        </form>
    </Card>
  )
}
