import React from 'react';
import { Mail, MessageCircle, FileText, Youtube, ExternalLink } from 'lucide-react';

const Help = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold mb-6">Help & Support</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quick Support Card */}
        <div className="card">
          <h3 className="text-xl font-display font-bold mb-4">Need Help?</h3>
          <p className="text-gray-300 mb-6">Our support team is here to help you with any questions or issues you might have.</p>
          <div className="flex gap-4">
            <button className="btn-primary flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Support
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat
            </button>
          </div>
        </div>

        {/* Documentation Card */}
        <div className="card">
          <h3 className="text-xl font-display font-bold mb-4">Documentation</h3>
          <p className="text-gray-300 mb-6">Explore our comprehensive documentation to learn more about LuminaWeb's features.</p>
          <button className="btn-primary flex items-center gap-2">
            <FileText className="h-5 w-5" />
            View Documentation
          </button>
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Youtube className="h-6 w-6 text-red-500" />
          <h3 className="text-xl font-display font-bold">Video Tutorials</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            'Getting Started with LuminaWeb',
            'Advanced Transformation Settings',
            'Customizing Your Design'
          ].map((title, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="aspect-video bg-black/30 rounded-lg mb-3 flex items-center justify-center">
                <Youtube className="h-8 w-8 text-red-500 opacity-50" />
              </div>
              <h4 className="font-medium mb-2">{title}</h4>
              <p className="text-sm text-gray-400">5:30 mins</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="card">
        <h3 className="text-xl font-display font-bold mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            {
              q: 'How does the AI transformation work?',
              a: "Our AI analyzes your existing website's design, content, and structure to create a modern, optimized version while maintaining your brand identity."
            },
            {
              q: 'How long does a transformation take?',
              a: 'Most transformations are completed within 5-10 minutes, depending on the size and complexity of your website.'
            },
            {
              q: 'Can I customize the transformed design?',
              a: 'Yes! After the AI generates your new design, you can customize colors, fonts, layouts, and other elements to match your preferences.'
            },
            {
              q: "What if I'm not satisfied with the results?",
              a: 'You can request unlimited revisions or start a new transformation. Our support team is always available to help you achieve the desired results.'
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-6">
              <h4 className="font-display font-bold mb-2">{faq.q}</h4>
              <p className="text-gray-300">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Link */}
      <div className="mt-8 text-center">
        <a href="#" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300">
          Join our Community Forum
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default Help;