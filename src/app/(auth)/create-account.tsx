'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock,  User, AlertCircle, Heart, CheckCircle2 } from 'lucide-react';
import { auth } from '@/utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function CreateAccountPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Password must include an uppercase letter, a number, and a special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setCreateSuccess(true);
      
      // Wait 2 seconds before redirecting to show success message
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email.';
      }
      
      setErrors({ general: errorMessage });
      setIsLoading(false);
    }
  };

  if (createSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-6">Your account has been successfully created. You will be redirected to the login page.</p>
            <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-white">
      {/* Left Side - Branding & Info */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-sky-500 p-8 relative items-center justify-center">
        <div className="absolute top-8 left-8 flex items-center">
          <Heart className="h-8 w-8 text-white" />
          <span className="ml-3 text-2xl font-bold text-white">NGO Connect</span>
        </div>
        
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-6">Join our mission today</h1>
          <p className="text-xl font-light mb-8">Create your NGO admin account to access tools for making positive change and connect with communities worldwide.</p>
          
          <div className="grid grid-cols-1 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
              <div className="flex items-center mb-3">
                <User className="h-6 w-6 text-white" />
                <span className="ml-2 text-sm font-medium text-white/80">Become Part of Our Team</span>
              </div>
              <p className="text-sm text-white/70">Join thousands of dedicated individuals working for positive change</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Create Account Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center mb-10">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-blue-600">NGO Connect</span>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Create Admin Account</h2>
              <p className="text-gray-500 mt-1">Fill in your details to get started</p>
            </div>
            
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{errors.general}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-5">
              {/* Full Name Field */}
              <div>
                <label className="text-gray-700 font-medium mb-2 block">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 transition-all`}
                    placeholder="John Doe"
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.fullName && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="text-gray-700 font-medium mb-2 block">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 transition-all`}
                    placeholder="you@example.com"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-gray-700 font-medium mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 transition-all`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">
                    Must be at least 8 characters with uppercase, number, and special character
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-gray-700 font-medium mb-2 block">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 transition-all`}
                    placeholder="••••••••"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
            
            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
          
          {/* Mobile Footer */}
          <div className="md:hidden mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 NGO Connect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
