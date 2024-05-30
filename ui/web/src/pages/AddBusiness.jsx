import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Alert,
  Label,
  TextInput,
  Button,
  RangeSlider,
  Select,
  Textarea,
} from "flowbite-react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import app from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function AddBusiness() {
  const [formData, setFormData] = useState({
    businessName: "",
    businessLogo: "",
    businessServices: [],
    zipCode: "",
    rangeInMiles: 15,
    businessDescription: "",
    businessCategory: "",
  });
  const [publishError, setPublishError] = useState(null);
  const { currentUser, token } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [mapPosition, setMapPosition] = useState([39.9526, -75.1652]);
  const [currentStep, setCurrentStep] = useState(0);
  const filePickerRef = useRef();
  const navigate = useNavigate();
  const [businessNameExists, setBusinessNameExists] = useState(false);
  const alertTimeoutRef = useRef(null);

  const checkBusinessNameExists = async (name) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/business/checkBusinessName`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ businessName: name }),
        }
      );
      const data = await res.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking business name:", error);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "rangeInMiles" ? parseInt(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError("Could not upload image (File must be less than 2MB)");
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData((prevData) => ({ ...prevData, businessLogo: downloadURL }));
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishError(null);

    const requiredFields = ["businessName", "businessCategory", "zipCode"];
    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      alert(`Please fill in the required fields: ${emptyFields.join(", ")}`);
      return;
    }

    try {
      if (!currentUser) {
        console.error("User not authenticated");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/business/addBusiness/${currentUser._id}`,
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

      navigate(`/dashboard/${currentUser._id}`);
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };

  const handleZipCodeChange = async (e) => {
    const zipCode = e.target.value;
    setFormData({ ...formData, zipCode });

    if (zipCode.length === 5) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=us&format=json`
        );
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          setMapPosition([parseFloat(lat), parseFloat(lon)]);
        }
      } catch (error) {
        console.error("Error fetching geolocation:", error);
      }
    }
  };


  
  const handleNext = async (e) => {
    e.preventDefault();
    if (currentStep === 0) {
      const nameExists = await checkBusinessNameExists(formData.businessName);
      if (nameExists) {
        setBusinessNameExists(true);
        return;
      } else {
        setBusinessNameExists(false); 
      }
    }
  
   
      setCurrentStep((prevStep) => prevStep + 1);
    
  };
  
  
  const handlePrev = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleServiceChange = (index, key, value) => {
    setFormData((prevData) => {
      const updatedServices = [...prevData.businessServices];
      updatedServices[index][key] = value;
      return { ...prevData, businessServices: updatedServices };
    });
  };

  const addService = () => {
    setFormData((prevData) => ({
      ...prevData,
      businessServices: [
        ...prevData.businessServices,
        { serviceName: "", minPrice: "", maxPrice: "" },
      ],
    }));
  };

  const removeService = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      businessServices: prevData.businessServices.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (publishError) {
      alertTimeoutRef.current = setTimeout(() => {
        setPublishError(null);
      }, 30000); // 30 seconds
    }

    return () => {
      clearTimeout(alertTimeoutRef.current);
    };
  }, [publishError]);

  const steps = [
    {
      label: "Business Name",
      content: (
        <div>
            
      {currentStep === 0 && (
        <div className="text-center mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
       
          <Label value="Business Name" />
          <TextInput
            id="businessName"
            type="text"
            name="businessName"
            placeholder="Your business Name"
            onChange={handleChange}
            value={formData.businessName}
            required
          />
        </div>
        )}
         {businessNameExists && (
              <Alert color="failure" className="lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full mx-auto mt-2 mb-2">
                Business name already exists. Please choose a different name.
              </Alert>
             )}
        </div>
      ),
    },
    {
      label: "Business Logo",
      content: (
        <div className="text-center mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={filePickerRef}
            hidden
          />
          <div
            className="relative mx-auto w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
            onClick={() => filePickerRef.current.click()}
          >
            {imageFileUploadProgress && (
              <CircularProgressbar
                value={imageFileUploadProgress || 0}
                text={`${imageFileUploadProgress}%`}
                strokeWidth={5}
                styles={{
                  root: {
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  },
                  path: {
                    stroke: `rgba(62, 152, 199, ${
                      imageFileUploadProgress / 100
                    })`,
                  },
                }}
              />
            )}
            <img
              src={
                imageFileUrl ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              alt="businessLogo"
              className={`rounded-full  w-full h-full object-cover border-8 border-[lightgray] ${
                imageFileUploadProgress &&
                imageFileUploadProgress < 100 &&
                "opacity-60"
              }`}
            />
          </div>
          {imageFileUploadError && (
            <Alert color="failure">{imageFileUploadError}</Alert>
          )}
        </div>
      ),
    },
    {
      label: "Business Category",
      content: (
        <div className="text-center mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
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
          <option value="heating and air condition services">
            heating and air condition services
          </option>
          <option value="locksmith services">locksmith services</option>
          <option value="tow truck services">tow truck services</option>
          <option value="pest control services">pest control services</option>
          <option value="swimming pool maintenance">swimming pool maintenance</option>
        </Select>
      </div>
      ),
    },
    {
      label: "Business Services",
      content: (
        <div className="mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
          <Label value="Business Services" />
          {formData.businessServices.map((service, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center mb-2">
                <TextInput
                  id={`serviceName-${index}`}
                  type="text"
                  name="serviceName"
                  placeholder="Service Name"
                  value={service.serviceName}
                  onChange={(e) =>
                    handleServiceChange(index, "serviceName", e.target.value)
                  }
                  required
                  className="mr-2"
                />
                <TextInput
                  id={`minPrice-${index}`}
                  type="number"
                  name="minPrice"
                  placeholder="Min Price"
                  value={service.minPrice}
                  onChange={(e) =>
                    handleServiceChange(index, "minPrice", e.target.value)
                  }
                  required
                  className="mr-2"
                />
                <TextInput
                  id={`maxPrice-${index}`}
                  type="number"
                  name="maxPrice"
                  placeholder="Max Price"
                  value={service.maxPrice}
                  onChange={(e) =>
                    handleServiceChange(index, "maxPrice", e.target.value)
                  }
                  required
                  className="mr-2"
                />
                <Button color="failure" onClick={() => removeService(index)}>
                  <FaTrash />
                </Button>
              </div>
            </div>
          ))}
          <Button color="success" onClick={addService}>
            <FaPlus className="mr-2" /> Add Service
          </Button>
        </div>
      ),
    },
    {
      label: "Business Location & Range",
      content: (
        <div className="text-center mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
          <Label value="Zip Code" />
          <TextInput
            id="zipCode"
            type="number"
            name="zipCode"
            placeholder="Your business zip code"
            onChange={handleZipCodeChange}
            value={formData.zipCode}
            required
          />
          <MapContainer
            center={mapPosition}
            zoom={8}
            
            style={{ height: "300px", width: "100%", marginTop: "20px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Circle
              center={mapPosition}
              radius={formData.rangeInMiles * 1609.34}
              color="blue"
              fillColor="blue"
              fillOpacity={0.3}
            />
          </MapContainer>
          <Label value={`Range in Miles: ${formData.rangeInMiles}`} className="mt-4"/>
          <RangeSlider
            id="rangeInMiles"
            name="rangeInMiles"
            min={1}
            max={100}
            step={1}
            value={formData.rangeInMiles} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mb-6 mt-2"
            style={{
              backgroundSize: `${((formData.rangeInMiles - 1) * 100) / 99}% 100%`,
              background:
                "linear-gradient(to right, #4CAF50, #4CAF50) 0/var(--tw-bg-size, 100%) no-repeat #E5E7EB",
            }}
          />
        </div>
      ),
    },
    {
      label: "Business Description",
      content: (
        <div className="text-center mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
          <Label value="Business Description" />
          <Textarea
            id="businessDescription"
            name="businessDescription"
            placeholder="Describe your business without adding any address, phone number, or email address."
            onChange={handleChange}
            value={formData.businessDescription}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen mt-20">
      <h1 className="text-2xl font-bold text-center mb-10">Add Your Business</h1>
      <form onSubmit={handleSubmit} className="mt-10">
        {steps[currentStep].content}
        <div className="flex justify-between mt-4 mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
          {currentStep > 0 && (
            <Button color="gray" onClick={handlePrev}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button color="blue" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" color="success">
              Submit
            </Button>
          )}
        </div>

        {publishError && (
          <Alert color="failure" className="mt-4 mx-auto lg:w-1/2 xl:w-1/4 md:w-1/2 sm:w-3/4 xs:w-full">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
