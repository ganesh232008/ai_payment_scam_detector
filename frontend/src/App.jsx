import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import Simulator from "./pages/Simulator";
import PaymentSafetyCheck from "./pages/PaymentSafetyCheck";
import RiskResult from "./pages/RiskResult";
import AnalystDashboard from "./pages/AnalystDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/safety-check" element={<PaymentSafetyCheck />} />
        <Route path="/risk-result" element={<RiskResult />} />
        <Route path="/analyst" element={<AnalystDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;