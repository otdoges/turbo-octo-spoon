import React from 'react';
import { Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient overlay for texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-800 opacity-90"></div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-3xl animate-float"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 10}s`
            }}
          />
        ))}
      </div>
      
      <div className="container-custom relative z-10 text-center px-4 pt-20">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
          <Sparkles size={16} className="text-purple-300 mr-2" />
          <span className="text-sm font-medium">AI-Powered Website Transformation</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 max-w-5xl mx-auto leading-tight">
          <span className="text-gradient">Dull Website?</span> <br />
          <span>Meet <span className="text-gradient">LuminaWeb.</span></span> <br />
          <span className="relative">
            Instant AI Redesign.
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Stop losing customers to bad design. Let our AI craft a stunning, professional website for you in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="btn-primary text-lg w-full sm:w-auto">
            Transform Your Site Now
          </button>
          <button className="btn-secondary w-full sm:w-auto">
            See Examples
          </button>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-pulse">
          <span className="text-sm mb-2">Scroll to learn more</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;