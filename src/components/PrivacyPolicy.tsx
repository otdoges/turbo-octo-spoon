import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="container-custom max-w-4xl">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-8">
            Last updated: March 15, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-300">
              LuminaWeb ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website transformation services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-display font-bold mb-3">2.1 Personal Information</h3>
            <p className="text-gray-300 mb-4">We may collect:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Website URLs and content</li>
              <li>Usage data and preferences</li>
            </ul>

            <h3 className="text-xl font-display font-bold mt-6 mb-3">2.2 Technical Information</h3>
            <p className="text-gray-300 mb-4">We automatically collect:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>IP addresses</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Usage patterns and preferences</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use collected information to:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Improve and personalize user experience</li>
              <li>Process payments and transactions</li>
              <li>Send administrative information</li>
              <li>Provide customer support</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-300">
              We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Service providers and business partners</li>
              <li>Legal authorities when required by law</li>
              <li>Third parties with your consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">5. Data Security</h2>
            <p className="text-gray-300">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">6. Your Rights</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">7. Cookies Policy</h2>
            <p className="text-gray-300">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">9. Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at privacy@luminaweb.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;