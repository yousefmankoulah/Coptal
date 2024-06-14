import { Alert, Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../../redux/user/userSlice";

export default function SendEmailCoach() {
  const [formData, setFormData] = useState({});

  const { error: errorMessage } = useSelector((state) => state.user);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      return dispatch(signInFailure("Please fill the field"));
    }
    try {
      dispatch(signInStart());
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/auth/forgetPasswordCoach`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }

      if (res.ok) {
        dispatch(signInSuccess(data));
        setShowSuccessAlert(true);
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              Online
            </span>
            Coaching
          </Link>
          <p className="text-sm mt-5">
            Enter your email address and check your inbox to reset your
            password. If you didn't receive the email please check your span
            inbox
          </p>
        </div>
        {/* right */}

        <div className="flex-1 ">
          <h1 className="text-3xl text-center font-bold">Reset the password</h1>
          <form className="flex flex-col gap-4 mt-10" onSubmit={handleSubmit}>
            <div>
              <Label value="Your email" />
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={handleChange}
              />
            </div>

            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
            >
              Reset your Password
            </Button>
          </form>

          {showSuccessAlert && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline">
                {" "}
                Check your email to reset the password.
              </span>
              <span
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setShowSuccessAlert(false)}
              >
                <svg
                  className="fill-current h-6 w-6 text-green-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 5.652a.5.5 0 0 1 .708.708L11.707 10l3.35 3.35a.5.5 0 1 1-.708.708L11 10.707l-3.65 3.65a.5.5 0 0 1-.708-.708l3.65-3.65-3.65-3.65a.5.5 0 0 1 .708-.708L11 9.293l3.65-3.65z" />
                </svg>
              </span>
            </div>
          )}
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}