'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Users, Heart, Globe, HandHeart, AlertCircle, Menu, X } from 'lucide-react';
import { auth } from '../../../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const validateEmail = (email: string): string | undefined => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return undefined;
};

export default function NGOLoginPortal() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleclick = () => {
    router.push('/forgot-password');
  }

  const validateForm = (): boolean => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    const newErrors: FormErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Sign in with existing account only
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Success - user is signed in
      const user = userCredential.user;
      console.log("User signed in:", user);
      
      // Redirect to dashboard
      router.push('/admin');
    } catch (error: any) {
      // Handle Firebase auth errors
      console.error("Auth error:", error);
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError('Too many failed login attempts. Please try again later or reset your password.');
      } else {
        setAuthError('An error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mr-3">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  <span className="text-blue-600">NGO</span> Portal
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Empowering communities through digital collaboration
                </p>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-blue-600"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-6 text-sm">
              <button className="text-gray-600 hover:text-blue-600 font-medium">About</button>
              <button className="text-gray-600 hover:text-blue-600 font-medium">Programs</button>
              <button className="text-gray-600 hover:text-blue-600 font-medium">Contact</button>
            </div>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="flex flex-col space-y-3 text-sm">
                <button className="text-gray-600 hover:text-blue-600 font-medium text-left">About</button>
                <button className="text-gray-600 hover:text-blue-600 font-medium text-left">Programs</button>
                <button className="text-gray-600 hover:text-blue-600 font-medium text-left">Contact</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)]">
        {/* Left Side - Features */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-4xl w-full">
            {/* Hero Section */}
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Connecting <span className="text-blue-600">Communities</span> for Change
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Join thousands of NGOs, volunteers, and community leaders working together to create positive impact across the globe.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {/* Community Engagement */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Community Engagement</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Connect with local communities and volunteers
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Volunteer management</li>
                  <li>• Community outreach</li>
                  <li>• Event coordination</li>
                </ul>
              </div>

              {/* Program Management */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <HandHeart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Program Management</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Streamline your NGO operations and programs
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Project tracking</li>
                  <li>• Resource allocation</li>
                  <li>• Impact measurement</li>
                </ul>
              </div>

              {/* Global Network */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Global Network</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Access a worldwide network of NGOs and resources
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Knowledge sharing</li>
                  <li>• Collaboration tools</li>
                  <li>• Best practices</li>
                </ul>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Partner NGOs</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">10K+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Active Volunteers</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">50+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Countries</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">1M+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Lives Impacted</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-96 p-4 sm:p-6 lg:p-8 bg-white lg:shadow-xl">
          <div className="max-w-sm mx-auto">
            <div className="mb-8 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Welcome back to NGO Portal</p>
            </div>

            <form className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Firebase Auth Error Message */}
              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{authError}</p>
                </div>
              )}

              {/* Forgot Password */}
              <div className="text-right">
                <button 
                  type="button"
                  onClick={handleclick} 
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <p className="text-sm text-gray-600">
                ©2025 <span className="font-semibold text-blue-600">Deep Nepal </span>
              </p>
              <p className="text-sm text-gray-500">
                Empowering communities through technology
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
              <button className="text-gray-600 hover:text-blue-600">About Us</button>
              <button className="text-gray-600 hover:text-blue-600">Support</button>
              <button className="text-gray-600 hover:text-blue-600">Resources</button>
            </div>

            <div className="text-sm">
              <p className="text-gray-600">
                <span className="text-blue-600 font-medium">Need help?</span> Contact us
              </p>
              <p className="text-gray-700 font-medium">support@ngoportal.org</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}