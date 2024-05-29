import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import { FaPlus } from "react-icons/fa";

export default function AddBusiness() {
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const { currentUser, token } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [rangeInMiles, setRangeInMiles] = useState(15);
  const [mapPosition, setMapPosition] = useState([39.9526, -75.1652]); // Default to Philadelphia
  const filePickerRef = useRef();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
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
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          "Could not upload image (File must be less than 2MB)"
        );
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, businessLogo: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    if (imageFileUploading) {
      setUpdateUserError("Please wait for image to upload");
      return;
    }
    try {
      if (!currentUser) {
        console.error("User not authenticated");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/auth/updateUser/${currentUser._id}`,
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
      if (res.ok) {
        setPublishError(null);
        navigate(`/dashboard/${currentUser._id}`);
      }
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

  return (
    <div className="min-h-screen mt-20">
      <h1 className="text-4xl text-center mt-10 mb-10">
        Add your Business Info
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4 mr-4 ml-4">
          <div className="flex flex-col gap-4 mx-auto w-3/4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={filePickerRef}
              hidden
            />
            <div
              className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
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
                className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
                  imageFileUploadProgress &&
                  imageFileUploadProgress < 100 &&
                  "opacity-60"
                }`}
              />
            </div>
            {imageFileUploadError && (
              <Alert color="failure">{imageFileUploadError}</Alert>
            )}
            <div>
              <Label value="Business Name" />
              <TextInput
                id="businessName"
                type="text"
                placeholder="Your business Name"
                onChange={handleChange}
                value={formData.businessName}
                required
              />
            </div>
            <div>
              <Label value="Business Category" />
              <Select
                id="businessCategory"
                value={formData.businessCategory}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Choose your business Category
                </option>
                <option>construction services</option>
                <option>cleaning services</option>
                <option>garage door services</option>
                <option>heating and air condition services</option>
                <option>locksmith services</option>
                <option>tow truck services</option>
                <option>pest control services</option>
                <option>swimming pool maintenance</option>
              </Select>
            </div>
            <div>
              <h3 className="text-xl font-bold text-center mt-4">
                Your Serving Area
              </h3>
              <Label value="Your Zip code" />
              <TextInput
                id="zipCode"
                type="number"
                placeholder="Your Zip code"
                value={formData.zipCode}
                onChange={handleZipCodeChange}
                required
              />
              <Label value="Your working range In Miles" />
              <RangeSlider
                id="rangeInMiles"
                min="1"
                max="100"
                value={rangeInMiles}
                onChange={(e) => setRangeInMiles(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mb-4"
                style={{
                  backgroundSize: `${((rangeInMiles - 1) * 100) / 99}% 100%`,
                  background:
                    "linear-gradient(to right, #4CAF50, #4CAF50) 0/var(--tw-bg-size, 100%) no-repeat #E5E7EB",
                }}
                required
              />
              <span>{rangeInMiles} miles</span>
              <div className="mt-10">
                <MapContainer
                  center={mapPosition}
                  zoom={6}
                  style={{ height: "300px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Circle
                    center={mapPosition}
                    radius={rangeInMiles * 1609.34} // Convert miles to meters
                  />
                </MapContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mx-auto w-3/4">
            <div className="mt-10 mb-10">
              <h3 className="text-lg font-bold text-center mt-4">
                Add Your Business Services and Prices
              </h3>
              <Button className="mr-auto ml-auto mt-2 flex items-center bg-blue-500 text-white rounded-md hover:bg-blue-600">
                <FaPlus className="mr-2 mt-auto mb-auto" />
                Add your Services
              </Button>
            </div>

            <div>
              <Label value="Business Description" />
              <Textarea
                id="businessDescription"
                type="text"
                placeholder="Don't add any phone number, email, or address"
                onChange={handleChange}
                value={formData.businessDescription}
                className="h-40"
              />
            </div>
          </div>
        </div>
        {publishError && <Alert color="failure">{publishError}</Alert>}
        <Button
          gradientDuoTone="purpleToPink"
          type="submit"
          className="w-94 mb-4 mx-auto"
        >
          Save Your Business
        </Button>
      </form>
    </div>
  );
}
