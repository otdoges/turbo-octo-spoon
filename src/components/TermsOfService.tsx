import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container-custom max-w-4xl">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-8">
            Last updated: March 15, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-300">
              By accessing or using LuminaWeb's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">2. Use License</h2>
            <p className="text-gray-300 mb-4">
              Permission is granted to temporarily access and use LuminaWeb's services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained in LuminaWeb</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">3. Service Description</h2>
            <p className="text-gray-300">
              LuminaWeb provides AI-powered website transformation services. While we strive for accuracy and optimal results, we cannot guarantee that our AI-generated designs will meet all specific requirements or preferences. Results may vary based on input quality and complexity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">4. User Obligations</h2>
            <p className="text-gray-300">
              Users must ensure they have the necessary rights and permissions for any content submitted to LuminaWeb for transformation. Users are responsible for maintaining the confidentiality of their account information and for all activities under their account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">5. Intellectual Property</h2>
            <p className="text-gray-300">
              The service, including all content, features, and functionality, is owned by LuminaWeb and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-300">
              LuminaWeb shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">7. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">8. Contact Information</h2>
            <p className="text-gray-300">
              Questions about the Terms of Service should be sent to us at support@luminaweb.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;