import { Alert, Button, Label, Spinner, TextInput, Modal } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import AcceptanceOfRules from "../components/AcceptanceOfRules";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      return setErrorMessage("Please fill out all fields.");
    }
    if (!isAccepted) {
      return setErrorMessage("You must accept the rules and disclaimers.");
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(
        `${import.meta.env.VITE_DOMAIN}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        return setErrorMessage(data.message);
      }
      setLoading(false);
      if (res.ok) {
        navigate("/sign-in");
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              Coptal
            </span>
          </Link>
          <p className="text-sm mt-5">
            Sign up to get more customers for your business without any annual fees or listing fees.
          </p>
        </div>
        {/* right */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your Full Name" />
              <TextInput
                type="text"
                placeholder="Full Name"
                id="fullName"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your email" />
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your password" />
              <TextInput
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                id="password"
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
            <div>
              <input
                type="checkbox"
                id="acceptRules"
                onChange={() => setIsAccepted(!isAccepted)}
                checked={isAccepted}
                required
              />
              <Label htmlFor="acceptRules" className="ml-1">
                I accept the 
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsModalOpen(true)}
                >
                  {" "}
                  Rules and Disclaimers
                </span>
              </Label>
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to="/sign-in" className="text-blue-500">
              Sign In
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg" position="center" className="fixed inset-0 flex items-center justify-center">
        <Modal.Header>
          Rules and Disclaimers
        </Modal.Header>
        <Modal.Body className="max-h-[80vh] overflow-y-auto">
          <AcceptanceOfRules />
        </Modal.Body>
        <Modal.Footer>
          <Button color="blue"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
