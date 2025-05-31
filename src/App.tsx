import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BeforeAfter from './components/BeforeAfter';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';

// Protected route component using Clerk
const ProtectedRoute: React.FC<{element: React.ReactElement}> = ({ element }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? element : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={
          <>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
            <SignedOut>
              <Auth />
            </SignedOut>
          </>
        } />
        <Route path="/dashboard/*" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-800 text-white">
            <Navbar />
            <main>
              <Hero />
              <HowItWorks />
              <BeforeAfter />
              <Features />
              <Testimonials />
              <FinalCTA />
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;