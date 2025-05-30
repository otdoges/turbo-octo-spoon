import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Johnson",
    company: "FitPro Coaching",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    stars: 5,
    quote: "My outdated website was driving clients away. After LuminaWeb's AI redesign, my bookings increased by 75% in the first month. The transformation was incredible."
  },
  {
    name: "Mark Chen",
    company: "TechNova Solutions",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    stars: 5,
    quote: "The speed and quality are unmatched. In 20 minutes, we went from an embarrassing website to a professional platform that properly represents our tech expertise."
  },
  {
    name: "Alexis Rivera",
    company: "Bloom Boutique",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    stars: 5,
    quote: "Our e-commerce conversions jumped 68% after switching to the LuminaWeb design. The AI understood our brand aesthetic perfectly and created something beautiful."
  }
];

const Testimonials = () => {
  return (
    <section className="section bg-gradient-to-b from-indigo-900/70 to-gray-900 relative">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover opacity-5"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            What Our <span className="text-gradient">Customers Say</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've transformed their online presence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="glassmorphism p-8 flex flex-col h-full transform transition-all duration-500 hover:scale-105"
            >
              <div className="mb-6">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="inline-block w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-gray-200 flex-grow mb-6">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-display font-bold">{testimonial.name}</div>
                  <div className="text-sm text-gray-300">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-lg text-purple-300 mb-6">Join 10,000+ businesses already transformed</p>
          <button className="btn-primary">Read More Success Stories</button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;