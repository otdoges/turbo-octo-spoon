import React from 'react';
import { ArrowRight } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-800"></div>
      
      {/* Abstract shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/20 filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-600/20 filter blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10 max-w-4xl">
        <div className="card bg-black/40 border border-white/10 p-10 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gradient">
            Ready to Illuminate Your Online Presence?
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that have transformed their websites from outdated to outstanding in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button className="btn-primary text-lg group flex items-center">
              Transform Your Site Now
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-secondary">
              Schedule a Demo
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            No credit card required. Free analysis of your current site included.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;