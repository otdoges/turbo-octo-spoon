import React from 'react';
import { Upload, Wand2, Rocket } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="h-8 w-8 text-purple-300" />,
    title: "Upload Your Site",
    description: "Simply provide your website URL or upload your design files. Our AI scans everything in seconds."
  },
  {
    icon: <Wand2 className="h-8 w-8 text-purple-300" />,
    title: "AI Analyzes & Redesigns",
    description: "Our powerful AI studies your brand and redesigns your site with modern aesthetics and improved UX."
  },
  {
    icon: <Rocket className="h-8 w-8 text-purple-300" />,
    title: "Launch Your New Look",
    description: "Review, customize if needed, and publish your stunning new website with one click."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works\" className="section bg-gradient-to-b from-purple-900/80 to-gray-900 relative">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover opacity-5"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            How <span className="text-gradient">LuminaWeb</span> Works
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our AI-powered process makes transforming your website easier than ever before
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="glassmorphism p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 mb-5">
                {step.icon}
              </div>
              <h3 className="text-xl font-display font-bold mb-3">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
              <div className="mt-4 text-primary-600 text-sm font-medium">Step {index + 1}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <button className="btn-primary">Start Your Transformation</button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;