import React, { useState, useRef } from 'react';

const examples = [
  {
    id: 1,
    before: "https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    after: "https://images.pexels.com/photos/34577/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    title: "E-commerce Store",
    improvements: ["Conversion rate +72%", "Mobile sales +124%", "Bounce rate -45%"]
  },
  {
    id: 2,
    before: "https://images.pexels.com/photos/35550/ipad-tablet-technology-touch.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    after: "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    title: "Agency Portfolio",
    improvements: ["Leads +55%", "Time on site +120%", "Client acquisition +38%"]
  },
  {
    id: 3,
    before: "https://images.pexels.com/photos/939331/pexels-photo-939331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    after: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    title: "SaaS Platform",
    improvements: ["Free trial signups +85%", "User engagement +63%", "Churn rate -32%"]
  }
];

const BeforeAfterSlider = ({ before, after }: { before: string, after: string }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(position, 0), 100));
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (sliderRef.current && e.touches[0]) {
      const rect = sliderRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const position = ((touch.clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(position, 0), 100));
    }
  };

  return (
    <div 
      ref={sliderRef}
      className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden cursor-grab"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After image (full width) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${after})` }}
      />
      
      {/* Before image (clipped) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${before})`,
          width: `${sliderPosition}%`,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
        }}
      >
        <div className="absolute inset-0 bg-gray-900/30"></div>
      </div>
      
      {/* Slider */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
        </div>
        <div className="absolute top-0 -translate-x-1/2 py-1 px-2 bg-black/70 text-xs rounded text-white">Before</div>
        <div className="absolute bottom-0 -translate-x-1/2 py-1 px-2 bg-black/70 text-xs rounded text-white">After</div>
      </div>
    </div>
  );
};

const BeforeAfter = () => {
  const [activeExample, setActiveExample] = useState(examples[0]);

  return (
    <section id="showcase" className="section bg-gray-900">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            See the <span className="text-gradient">Transformation</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Real websites, real results. Drag the slider to see the dramatic before & after differences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2">
            <BeforeAfterSlider before={activeExample.before} after={activeExample.after} />
            
            <div className="mt-6 card">
              <h3 className="text-xl font-display font-bold mb-2">{activeExample.title}</h3>
              <div className="flex flex-wrap gap-3 mt-3">
                {activeExample.improvements.map((improvement, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-300 border border-green-500/30"
                  >
                    {improvement}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-span-1 space-y-4">
            <h3 className="text-xl font-display font-bold mb-4">More Examples</h3>
            {examples.map(example => (
              <div 
                key={example.id}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  activeExample.id === example.id 
                    ? 'bg-white/15 border-l-4 border-primary-600' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setActiveExample(example)}
              >
                <h4 className="font-display font-bold">{example.title}</h4>
                <p className="text-sm text-gray-300 mt-1">Click to view transformation</p>
              </div>
            ))}
            
            <div className="mt-6">
              <button className="btn-primary w-full">See More Examples</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;