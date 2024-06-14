import { useState } from "react";
import { useSelector } from "react-redux";
import { Label, TextInput, Button, Textarea, Card, Alert } from "flowbite-react";

export default function RequestAccess({ id, onClose }) {
  const [requestData, setRequestData] = useState({
    service: "",
    serviceDate: "",
    serviceDescription: "",
    zipcode: "",
    phoneNumber: "",
    offerPrice: ""
  });
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const { currentUser, token } = useSelector((state) => state.user);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setRequestData((prevState) => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setPublishError(null);
    setFormSubmitted(true);

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
          body: JSON.stringify(requestData),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.message);
        setFormSubmitted(false)
        return;
      }
      setPublishSuccess(true);
      setTimeout(() => {
        onClose(); // Close the modal after a short delay
      }, 1500); // Adjust the delay as needed
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };

  return (
    <Card className="mx-auto my-auto rounded-2xl shadow-2xl">
      <form onSubmit={handleRequest}>
        <Label value="The service Name" />
        <TextInput
          id="service"
          type="text"
          name="service"
          placeholder="The service needed"
          onChange={handleChange}
          value={requestData.service}
          required
        />
        <Label value="The service Date" />
        <TextInput
          id="serviceDate"
          type="date"
          name="serviceDate"
          placeholder="The service Date"
          onChange={handleChange}
          value={requestData.serviceDate}
          required
        />
        <Label value="The service Description" />
        <Textarea
          id="serviceDescription"
          name="serviceDescription"
          placeholder="The service Description"
          onChange={handleChange}
          value={requestData.serviceDescription}
          className="h-24"
        />
        <Label value="The service Zipcode" />
        <TextInput
          id="zipcode"
          type="number"
          name="zipcode"
          placeholder="The service Zipcode"
          onChange={handleChange}
          value={requestData.zipcode}
          required
        />
        <Label value="Your phone Number" />
        <TextInput
          id="phoneNumber"
          type="number"
          name="phoneNumber"
          placeholder="Your phone Number"
          onChange={handleChange}
          value={requestData.phoneNumber}
          required
        />
        <Label value="The service offer Price" />
        <TextInput
          id="offerPrice"
          type="number"
          name="offerPrice"
          placeholder="The service offer Price"
          onChange={handleChange}
          value={requestData.offerPrice}
          required
        />

        {formSubmitted && !publishSuccess ? (
          <Button type="button" color="success" disabled className="mx-auto mt-5">
            Submitting...
          </Button>
        ) : formSubmitted && publishSuccess ? (
          <Button type="button" color="success" className="mx-auto mt-5">
            <span role="img" aria-label="Success" style={{ color: "white" }}>&#10004;</span> Request Sent Successfully
          </Button>
        ) : (
          <Button type="submit" className="mx-auto mt-5" color="success">
            Submit Request
          </Button>
        )}
        {publishError && (
          <Alert color="failure" className="mt-4 mx-auto w-full">
            {publishError}
          </Alert>
        )}
      </form>
    </Card>
  );
}
