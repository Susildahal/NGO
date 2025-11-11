'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { getFileUrl } from '@/utils/fileHelpers';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGallery: any;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose, editingGallery }) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingGallery?.image) {
      setImagePreview(getFileUrl(editingGallery.image, 'image'));
    } else {
      setImagePreview('');
    }
  }, [editingGallery]);

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(3, 'Title must be at least 3 characters')
      .required('Title is required'),
    subtitle: Yup.string()
      .min(3, 'Subtitle must be at least 3 characters')
      .required('Subtitle is required'),
    address: Yup.string(),
  });

  const initialValues = {
    title: editingGallery?.title || '',
    subtitle: editingGallery?.subtitle || '',
    address: editingGallery?.address || '',
    image: null as File | null,
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('subtitle', values.subtitle);
      if (values.address) {
        formData.append('address', values.address);
      }

      if (values.image) {
        formData.append('image', values.image);
      }

      if (editingGallery) {
        const galleryId = editingGallery.id || editingGallery._id;
        await axiosInstance.put(`/gallery/${galleryId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Gallery item updated successfully!');
      } else {
        await axiosInstance.post('/gallery', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Gallery item created successfully!');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving gallery item:', error);
      toast.error(error.response?.data?.message || 'Failed to save gallery item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-foreground">
                {editingGallery ? 'Edit Gallery Item' : 'Add Gallery Item'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <Field
                      name="title"
                      type="text"
                      className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter gallery title"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subtitle <span className="text-destructive">*</span>
                    </label>
                    <Field
                      name="subtitle"
                      type="text"
                      className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter subtitle"
                    />
                    <ErrorMessage
                      name="subtitle"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address (Optional)
                    </label>
                    <Field
                      name="address"
                      type="text"
                      className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter address"
                    />
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Image {!editingGallery && <span className="text-destructive">*</span>}
                    </label>
                    <div className="space-y-3">
                      {imagePreview && (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
                          <Upload size={18} />
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, setFieldValue)}
                            className="hidden"
                          />
                        </label>
                        {!editingGallery && !values.image && (
                          <span className="text-sm text-muted-foreground">
                            Image is required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || (!editingGallery && !values.image)}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {editingGallery ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>{editingGallery ? 'Update' : 'Create'} Gallery</>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GalleryModal;
