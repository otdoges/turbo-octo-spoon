import React from 'react';
import { Brain, Smartphone, Search, Palette } from 'lucide-react';

const features = [
  {
    icon: <Brain className="h-8 w-8 text-purple-300" />,
    title: "AI-Powered Design Engine",
    description: "Our proprietary AI understands visual hierarchy, psychology, and conversion principles to create designs that look amazing and drive results."
  },
  {
    icon: <Smartphone className="h-8 w-8 text-purple-300" />,
    title: "Mobile-First Optimization",
    description: "Every redesign is built for perfect performance across all devices, with special attention to mobile experience and speed."
  },
  {
    icon: <Search className="h-8 w-8 text-purple-300" />,
    title: "SEO-Friendly Structure",
    description: "We maintain your SEO equity while implementing technical improvements that help search engines better understand your content."
  },
  {
    icon: <Palette className="h-8 w-8 text-purple-300" />,
    title: "Brand Consistency Tools",
    description: "Our AI extracts and enhances your brand identity, ensuring the new design feels like an evolution, not a replacement."
  }
];

const Features = () => {
  return (
    <section id="features\" className="section bg-gradient-to-b from-gray-900 to-indigo-900/70 relative">
      <div className="absolute inset-0 bg-gradient-radial from-primary-600/20 via-transparent to-transparent opacity-70"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Powerful <span className="text-gradient">Features</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            LuminaWeb combines cutting-edge AI with professional design principles
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            // Alternate layout for even/odd rows
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="flex flex-col md:flex-row items-start gap-6">
                {!isEven && <div className="hidden md:block md:flex-1"></div>}
                <div className="md:flex-1 space-y-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-white/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-display font-bold">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                  <a href="#" className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors font-medium">
                    Learn more
                    <svg className="ml-1 w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
                {isEven && <div className="hidden md:block md:flex-1"></div>}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-16">
          <button className="btn-primary">Explore All Features</button>
        </div>
      </div>
    </section>
  );
};

export default Features;