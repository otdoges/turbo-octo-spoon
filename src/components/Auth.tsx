import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';

const Auth = () => {
  const location = useLocation();
  const isSignUp = location.hash === '#sign-up';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Zap className="h-8 w-8 text-white" />
            <span className="text-2xl font-display font-bold text-gradient">LuminaWeb</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="glassmorphism p-8">
          {isSignUp ? (
            <SignUp routing="hash" signInUrl="#sign-in" />
          ) : (
            <SignIn routing="hash" signUpUrl="#sign-up" />
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <span className="mx-2">•</span>
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;