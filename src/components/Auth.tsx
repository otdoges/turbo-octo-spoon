import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Github, Mail } from 'lucide-react';
import { AuthContext } from '../App';

type AuthMode = 'login' | 'signup';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the login function from AuthContext
      login();
      
      // Complete loading and redirect
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        {/* Auth Card */}
        <div className="glassmorphism p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <Zap className="h-8 w-8 text-white" />
              <span className="text-2xl font-display font-bold text-gradient">LuminaWeb</span>
            </Link>
            <h1 className="text-2xl font-display font-bold mt-6 mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-gray-300">
              {mode === 'login' 
                ? 'Enter your details to access your account' 
                : 'Get started with your free account today'}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors border border-white/10">
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors border border-white/10">
              <Mail className="h-5 w-5" />
              <span>Google</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1a2e] text-gray-300">or continue with</span>
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name\" className="block text-sm font-medium mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 focus:border-primary-600 focus:ring focus:ring-primary-600/20 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 focus:border-primary-600 focus:ring focus:ring-primary-600/20 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 focus:border-primary-600 focus:ring focus:ring-primary-600/20 transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 focus:border-primary-600 focus:ring focus:ring-primary-600/20 transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-6 relative"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Processing...
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <p className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <span className="mx-2">•</span>
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;