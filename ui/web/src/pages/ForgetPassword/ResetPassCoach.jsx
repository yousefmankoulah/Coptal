import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useSelector } from "react-redux";
import { Alert, Label, TextInput, Button } from "flowbite-react";


export default function ResetPassCoach() {
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);
    const { currentUser, token } = useSelector((state) => state.user);

    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);


    const [showPassword, setShowPassword] = useState(false);
  
    const handleShowPassword = () => {
      setShowPassword(!showPassword);
    };
  
    const navigate = useNavigate();
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    };
  

    const handleSubmit = async (e) => {
      e.preventDefault();
      setUpdateUserError(null);
      setUpdateUserSuccess(null);
      if (Object.keys(formData).length === 0) {
        setUpdateUserError("No changes made");
        return;
      }
     
      try {
  
        const res = await fetch(
          `${import.meta.env.VITE_DOMAIN}/api/auth/updatePassword`,
          {
            method: "PUT",
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
          navigate(`/sign-in`);
        }
      } catch (error) {
        setPublishError("Something went wrong");
      }
    };
  
  
    return (
      <div className="min-h-screen mt-20">
        <h1 className="text-4xl text-center mt-10 mb-10">Update Your Password</h1>
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

              <div>
                <Label value="Your New Password" />
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new Password"
                  onChange={handleChange}
                  value={formData.password}
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
                Update You Password
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