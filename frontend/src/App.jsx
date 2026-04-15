import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BookingPage from "./pages/BookingPage";
import Confirmation from "./pages/Confirmation";
import Bookings from "./pages/Bookings";
import Home from "./pages/Home";
import AvailabilityPage from "./pages/AvailabilityPage";

function AppLayout() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/availability" element={<AvailabilityPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
