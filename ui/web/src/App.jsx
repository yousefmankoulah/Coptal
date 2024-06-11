import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import OnlyAdminPrivateRoute from "./components/OnlyAdminPrivateRoute";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import AddBusiness from "./pages/AddBusiness";
import AllBusiness from "./pages/AllBusiness";
import Dashboard from "./pages/Dashboard";
import UpdateBusiness from "./pages/UpdateBusiness";
import BusinessDetail from "./pages/BusinessDetail";
import { UpdateUser } from "./pages/UpdateUser";
import RequestDetail from "./pages/RequestDetail";


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/" element={<AllBusiness />} />
        <Route path="/businessDetail/:id" element={<BusinessDetail />} />

        <Route element={<OnlyAdminPrivateRoute />}></Route>

        <Route element={<PrivateRoute />}>
          <Route path="/addBusiness" element={<AddBusiness />} />
          <Route path="/updateBusiness/:id" element={<UpdateBusiness />} />
          <Route path="/updateUser/:id" element={<UpdateUser />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/RequestDetail/:id" element={<RequestDetail />} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
