import React, { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/clerk-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/20 backdrop-blur-lg py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <div className="flex items-center">
          <Zap className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-display font-bold text-gradient">LuminaWeb</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white hover:text-purple-300 transition-colors">Features</a>
          <a href="#how-it-works" className="text-white hover:text-purple-300 transition-colors">How It Works</a>
          <a href="#showcase" className="text-white hover:text-purple-300 transition-colors">Showcase</a>
          <a href="#pricing" className="text-white hover:text-purple-300 transition-colors">Pricing</a>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-secondary">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary">Get Started</button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <Link to="/dashboard" className="btn-secondary mr-4">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-lg p-5 flex flex-col space-y-4 border-t border-white/10">
          <a 
            href="#features" 
            className="text-white py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="text-white py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            How It Works
          </a>
          <a 
            href="#showcase" 
            className="text-white py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Showcase
          </a>
          <a 
            href="#pricing" 
            className="text-white py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </a>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-secondary w-full">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary w-full mt-2">Get Started</button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <Link to="/dashboard" className="btn-secondary w-full">Dashboard</Link>
            <div className="flex justify-center mt-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      )}
    </nav>
  );
};

export default Navbar;