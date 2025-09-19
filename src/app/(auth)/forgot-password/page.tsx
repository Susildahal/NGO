'use client'
import React, { useState } from 'react';
import { Mail, AlertCircle, Heart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { auth } from '@/utils/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleResetPassword = async (): Promise<void> => {
    if (!validateEmail()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
       
        setResetSent(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-md w-full">
        {/* Mobile Logo */}
        <div className="flex items-center justify-center mb-10">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-blue-600">NGO Connect</span>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <Link href="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
          
          {resetSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <span className="font-medium">{email}</span>.
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
                <p>Didn't receive an email? Check your spam folder or try again with a different email.</p>
              </div>
              <Link href="/login" className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-md">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Forgot Your Password?</h2>
                <p className="text-gray-500 mt-1">Enter your email and we'll send you instructions to reset your password.</p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="text-gray-700 font-medium mb-2 block">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 transition-all`}
                      placeholder="you@example.com"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 NGO Connect. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
