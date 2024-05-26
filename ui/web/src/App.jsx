import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import OnlyAdminPrivateRoute from "./components/OnlyAdminPrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />

      <Routes>
        <Route element={<OnlyAdminPrivateRoute />}></Route>

        <Route element={<PrivateRoute />}></Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
