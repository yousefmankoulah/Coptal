import { Button, Badge, Rating, TextInput, Label, Select, Alert } from "flowbite-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

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

  console.log(formData)

  return (
    <div>{formData.businessName}</div>
  )
}
