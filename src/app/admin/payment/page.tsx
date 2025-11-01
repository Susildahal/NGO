'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';


// Types
interface BankDetails {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  phoneNumber: string;
  email: string;
  ifscCode: string;
  branchName: string;
  accountType: 'Savings' | 'Current' | 'Business';
  qrCodeImage: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface ImageUploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  message: string;
}

// Validation Schema
const validationSchema = Yup.object().shape({
  bankName: Yup.string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name must not exceed 100 characters')
    .required('Bank name is required'),
  accountNumber: Yup.string()
    .matches(/^[0-9]{10,18}$/, 'Account number must be 10-18 digits')
    .required('Account number is required'),
  accountHolderName: Yup.string()
    .min(2, 'Account holder name must be at least 2 characters')
    .max(100, 'Account holder name must not exceed 100 characters')
    .required('Account holder name is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9\s\-\+()]{10,15}$/, 'Phone number is invalid')
    .required('Phone number is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  ifscCode: Yup.string()
    .matches(/^[A-Z0-9]{11}$/, 'IFSC code must be 11 characters (alphanumeric)')
    .required('IFSC code is required'),
  branchName: Yup.string()
    .min(2, 'Branch name must be at least 2 characters')
    .max(100, 'Branch name must not exceed 100 characters')
    .required('Branch name is required'),
  accountType: Yup.string()
    .oneOf(['Savings', 'Current', 'Business'], 'Invalid account type')
    .required('Account type is required'),
  status: Yup.string()
    .oneOf(['Active', 'Inactive'], 'Invalid status')
    .required('Status is required'),
});

const BankCRUDApp = () => {
  const [banks, setBanks] = useState<BankDetails[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankDetails | null>(null);
  const [imageUploadStatus, setImageUploadStatus] = useState<ImageUploadStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      phoneNumber: '',
      email: '',
      ifscCode: '',
      branchName: '',
      accountType: 'Savings' as const,
      status: 'Active' as const,
    },
    validationSchema,
    onSubmit: (values) => {
      const newBank: BankDetails = {
        ...values,
        qrCodeImage,
        id: editingBank?.id || Date.now().toString(),
        createdAt: editingBank?.createdAt || new Date().toISOString()
      };

      if (editingBank) {
        setBanks(prev => prev.map(bank => bank.id === editingBank.id ? newBank : bank));
      } else {
        setBanks(prev => [...prev, newBank]);
      }

      resetForm();
    },
  });

  // Simulate image upload with progress
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadStatus({ status: 'uploading', progress: 0, message: 'Uploading image...' });

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 100) progress = 100;
      setImageUploadStatus(prev => ({ ...prev, progress: Math.round(progress) }));
      
      if (progress >= 100) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onloadend = () => {
          setQrCodeImage(reader.result as string);
          setImageUploadStatus({ 
            status: 'success', 
            progress: 100, 
            message: 'Image uploaded successfully!' 
          });
          setTimeout(() => {
            setImageUploadStatus({ status: 'idle', progress: 0, message: '' });
          }, 2000);
        };
        reader.readAsDataURL(file);
      }
    }, 300);
  };

  const handleEdit = (bank: BankDetails) => {
    setEditingBank(bank);
    const newValues = {
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountHolderName: bank.accountHolderName,
      phoneNumber: bank.phoneNumber,
      email: bank.email,
      ifscCode: bank.ifscCode,
      branchName: bank.branchName,
      accountType: bank.accountType as never,
      status: bank.status as never,
    };
    formik.resetForm({ values: newValues });
    setQrCodeImage(bank.qrCodeImage);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      setBanks(prev => prev.filter(bank => bank.id !== id));
    }
  };

  const resetForm = () => {
    formik.resetForm();
    setQrCodeImage('');
    setEditingBank(null);
    setIsModalOpen(false);
    setImageUploadStatus({ status: 'idle', progress: 0, message: '' });
  };

  const getFieldError = (fieldName: keyof typeof formik.values) => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? formik.errors[fieldName]
      : null;
  };

  const handleOpenModal = () => {
    setEditingBank(null);
    setQrCodeImage('');
    formik.resetForm();
    setImageUploadStatus({ status: 'idle', progress: 0, message: '' });
    setIsModalOpen(true);
  };

  if (!mounted) return null;

  return (
    <>
    <div className="min-h-screen   duration-300">
      <div className=" mx-auto">
        {/* Header */}
        <motion.div 
   
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">Bank Details Manager</h1>
            <p className="text-muted-foreground ">Manage your bank accounts efficiently</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-primary text-sm text-primary-foreground px-3 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Plus size={10} />
            Add Bank Account
          </motion.button>
        </motion.div>

        {/* Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card dark:bg-slate-900  overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted dark:bg-slate-800 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Bank Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Account Holder</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Account Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">IFSC Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">QR Code</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {banks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        No bank accounts found. Add your first account to get started!
                      </td>
                    </tr>
                  ) : (
                    banks.map((bank) => (
                      <motion.tr
                        key={bank.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="border-b border-border hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-foreground">{bank.bankName}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{bank.accountHolderName}</td>
                        <td className="px-6 py-4 text-sm font-mono text-foreground">{bank.accountNumber}</td>
                        <td className="px-6 py-4 text-sm font-mono text-foreground">{bank.ifscCode}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{bank.phoneNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bank.status === 'Active' 
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                              : 'bg-red-500/20 text-red-700 dark:text-red-400'
                          }`}>
                            {bank.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {bank.qrCodeImage ? (
                            <img src={bank.qrCodeImage} alt="QR Code" className="w-12 h-12 rounded border border-border" />
                          ) : (
                            <span className="text-xs text-muted-foreground">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(bank)}
                              className="p-2 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                            >
                              <Pencil size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(bank.id)}
                              className="p-2 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => resetForm()}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-card dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border"
            >
              <div className="sticky top-0 bg-card dark:bg-slate-900 border-b border-border px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingBank ? 'Edit Bank Account' : 'Add New Bank Account'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-muted dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={24} className="text-foreground" />
                </button>
              </div>

              <form onSubmit={formik.handleSubmit} className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bank Name */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps('bankName')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                          getFieldError('bankName') ? 'border-destructive' : 'border-input'
                        }`}
                        placeholder="e.g., State Bank of India"
                      />
                      {getFieldError('bankName') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('bankName')}
                        </div>
                      )}
                    </div>

                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps('accountHolderName')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                          getFieldError('accountHolderName') ? 'border-destructive' : 'border-input'
                        }`}
                        placeholder="e.g., John Doe"
                      />
                      {getFieldError('accountHolderName') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('accountHolderName')}
                        </div>
                      )}
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps('accountNumber')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono ${
                          getFieldError('accountNumber') ? 'border-destructive' : 'border-input'
                        }`}
                        placeholder="e.g., 1234567890"
                      />
                      {getFieldError('accountNumber') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('accountNumber')}
                        </div>
                      )}
                    </div>

                    {/* IFSC Code */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps('ifscCode')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono uppercase ${
                          getFieldError('ifscCode') ? 'border-destructive' : 'border-input'
                        }`}
                        placeholder="e.g., SBIN0001234"
                      />
                      {getFieldError('ifscCode') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('ifscCode')}
                        </div>
                      )}
                    </div>

                    {/* Branch Name */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Branch Name *
                      </label>
                      <input
                        type="text"
                        {...formik.getFieldProps('branchName')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                          getFieldError('branchName') ? 'border-destructive' : 'border-input'
                        }`}
                        placeholder="e.g., Main Branch"
                      />
                      {getFieldError('branchName') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('branchName')}
                        </div>
                      )}
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Account Type *
                      </label>
                      <select
                        {...formik.getFieldProps('accountType')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                          getFieldError('accountType') ? 'border-destructive' : 'border-input'
                        }`}
                      >
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                        <option value="Business">Business</option>
                      </select>
                      {getFieldError('accountType') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('accountType')}
                        </div>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...formik.getFieldProps('phoneNumber')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                          getFieldError('phoneNumber') ? 'border-destructive' : 'border-input'
                        }`}
                        placeholder="e.g., +1234567890"
                      />
                      {getFieldError('phoneNumber') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('phoneNumber')}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        {...formik.getFieldProps('email')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                          getFieldError('email') ? 'border-destructive' : 'border-input'
                        }`}
                        placeholder="e.g., john@example.com"
                      />
                      {getFieldError('email') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('email')}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Status *
                      </label>
                      <select
                        {...formik.getFieldProps('status')}
                        className={`w-full px-4 py-2 border rounded-lg bg-background dark:bg-slate-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                          getFieldError('status') ? 'border-destructive' : 'border-input'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      {getFieldError('status') && (
                        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                          <AlertCircle size={16} />
                          {getFieldError('status')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QR Code Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      QR Code Image
                    </label>
                    <div className="border-2 border-dashed border-input dark:border-slate-700 rounded-lg p-6 text-center hover:border-primary dark:hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="qr-upload"
                      />
                      <label htmlFor="qr-upload" className="cursor-pointer">
                        {qrCodeImage ? (
                          <div className="flex flex-col items-center gap-3">
                            <img src={qrCodeImage} alt="QR Preview" className="w-32 h-32 rounded-lg border border-border" />
                            <span className="text-sm text-primary hover:text-primary/80">Change Image</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <Upload className="w-12 h-12 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to upload QR code image</span>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Upload Status */}
                    <AnimatePresence>
                      {imageUploadStatus.status !== 'idle' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4"
                        >
                          <div className="bg-muted dark:bg-slate-800 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              {imageUploadStatus.status === 'uploading' && (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                              )}
                              {imageUploadStatus.status === 'success' && (
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                              )}
                              <span className="text-sm font-medium text-foreground">
                                {imageUploadStatus.message}
                              </span>
                            </div>
                            {imageUploadStatus.status === 'uploading' && (
                              <div className="w-full bg-muted dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${imageUploadStatus.progress}%` }}
                                  className="h-full bg-primary"
                                  transition={{ duration: 0.1 }}
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-border">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                      className="px-6 py-2 border border-input text-foreground rounded-lg hover:bg-muted dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={formik.isSubmitting || !formik.isValid}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                    >
                      {editingBank ? 'Update Account' : 'Add Account'}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    
    </div>

   </>
  );
};

export default BankCRUDApp;