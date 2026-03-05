import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Import ONLY the pages you actually have
import {
  LoginPage,
  ResultsPage,
  HeroPromoPage,
  ResultsLoadingPage,
  InterviewPage // I added this here so everything is imported neatly
} from '../pages'
import Camerascreen from '../pages/Camerascreen'

export function AppRouter() {
  return (
    <Routes>
      {/* Public marketing/landing pages */}
      <Route path="/" element={<HeroPromoPage />} />
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      {/* App experience */}
      <Route path="/interview" element={<InterviewPage />} /> {/* Fixed typo from /interviw */}
      <Route path="/results-loading" element={<ResultsLoadingPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path='/camera' element={<Camerascreen/>} />

      {/* I commented these out because you don't have the files yet! 
        Uncomment them when you create DashboardPage.jsx and LandingAuthPage.jsx
      */}
      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      {/* <Route path="/home" element={<LandingAuthPage />} /> */}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter