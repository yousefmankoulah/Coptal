import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useSelector } from "react-redux";
import { Alert, Label, TextInput, Button } from "flowbite-react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import { useDispatch } from "react-redux";

export function UpdateUser() {
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
  const filePickerRef = useRef();


  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  useEffect(() => {
    try {
      const fetchPost = async () => {
        const res = await fetch(
          `${import.meta.env.VITE_DOMAIN}/api/auth/coachProfile/${currentUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setPublishError(data.message);
          return;
        }
        if (res.ok) {
          setPublishError(null);
          setFormData({
            fullName: data.fullName,
            email: data.email,
            profilePicture: data.profilePicture,
          });
        }
      };

      fetchPost();
    } catch (error) {
      console.log(error.message);
    }
  }, [currentUser._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }
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
          method: "PUT",
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


  return (
    <div className="min-h-screen mt-20">
      <h1 className="text-4xl text-center mt-10 mb-10">Update Your Profile</h1>
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              Coptal
            </span>
            
          </Link>
         
        </div>
        {/* right */}

        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                src={imageFileUrl || currentUser.profilePicture}
                alt="user"
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
              <Label value="Your Name" />
              <TextInput
                id="fullName"
                type="text"
                placeholder="Your Name"
                onChange={handleChange}
                value={formData.fullName}
              />
            </div>

            <div>
              <Label value="Your Email" />
              <TextInput
                id="email"
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your New Password" />
              <TextInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new Password"
                onChange={handleChange}
              />
              <input
                type="checkbox"
                onChange={handleShowPassword}
                id="showPassword"
                checked={showPassword}
              />
              <Label value=" Show The Password" />
            </div>

            <Button gradientDuoTone="purpleToPink" type="submit">
              Update The Account
            </Button>
          </form>

          {publishError && (
            <Alert className="mt-5" color="failure">
              {publishError}
            </Alert>
          )}
        </div>
      </div>

   
    </div>
  );
}