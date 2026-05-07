import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"

// Doctor Pages
import DoctorPage from "./pages/doctor/DoctorPage"
import DoctorProfilePage from "./pages/doctor/DoctorProfilePage"
import DoctorSettingsPage from "./pages/doctor/DoctorSettingsPage"

// Nurse Pages
import NursePage from "./pages/nurse/NursePage"
import NurseProfilePage from "./pages/nurse/NurseProfilePage"
import NurseSettingsPage from "./pages/nurse/NurseSettingsPage"

// Patient Pages
import PatientPage from "./pages/patient/PatientPage"
import PatientProfilePage from "./pages/patient/PatientProfilePage"
import PatientSettingsPage from "./pages/patient/PatientSettingsPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/doctor/profile" element={<DoctorProfilePage />} />
          <Route path="/doctor/settings" element={<DoctorSettingsPage />} />
          
          {/* Nurse Routes */}
          <Route path="/nurse" element={<NursePage />} />
          <Route path="/nurse/profile" element={<NurseProfilePage />} />
          <Route path="/nurse/settings" element={<NurseSettingsPage />} />
          
          {/* Patient Routes */}
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/patient/profile" element={<PatientProfilePage />} />
          <Route path="/patient/settings" element={<PatientSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
