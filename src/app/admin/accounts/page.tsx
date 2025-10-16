'use client'

import React, { useState, useEffect } from 'react';
import { auth } from '@/utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff, Mail, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Sidebar';


interface AccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface AccountFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<AccountFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        // Redirect to login if not authenticated
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: AccountFormErrors = {};

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

  const handleInputChange = (field: keyof AccountFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create the user in Firebase
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // Show success message
      setSuccessMessage('Account created successfully!');

      // Reset form and close it
      setFormData({
        email: '',
        password: '',
        confirmPassword: ''
      });

      setShowCreateForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email.';
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
 
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {successMessage && (
            <div className="fixed top-4 right-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              <p>{successMessage}</p>
            </div>
          )}

        
        

        

        
       
            <div className="  flex items-center justify-center z-50 p-4">
              <div className=" rounded-xl shadow-xl max-w-md w-full">
             

                <div className="p-6">
                  {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <p>{errors.general}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="user@example.com"
                          className={`w-full px-3 py-2 pl-10 border rounded-lg text-sm dark:text-white  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-3 py-2 pr-10 border dark:text-white rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                            errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-3 py-2 border dark:text-white  rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                    
                      <button
                        onClick={handleCreateAccount}
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <span>Create Account</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        

         
        </div>
      </div>
    
  );
}



