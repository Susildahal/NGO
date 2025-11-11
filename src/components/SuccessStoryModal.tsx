'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { getFileUrl } from '@/utils/fileHelpers';

interface SuccessStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSuccessStory: any;
}

const SuccessStoryModal: React.FC<SuccessStoryModalProps> = ({ isOpen, onClose, editingSuccessStory }) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingSuccessStory?.image) {
      setImagePreview(getFileUrl(editingSuccessStory.image, 'image'));
    } else {
      setImagePreview('');
    }
  }, [editingSuccessStory]);

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(3, 'Title must be at least 3 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .required('Description is required'),
  });

  const initialValues = {
    title: editingSuccessStory?.title || '',
    description: editingSuccessStory?.description || '',
    image: null as File | null,
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);

      if (values.image) {
        formData.append('image', values.image);
      }

      if (editingSuccessStory) {
        const successStoryId = editingSuccessStory.id || editingSuccessStory._id;
        await axiosInstance.put(`/successstory/${successStoryId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Success story updated successfully!');
      } else {
        await axiosInstance.post('/successstory', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Success story created successfully!');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving success story:', error);
      toast.error(error.response?.data?.message || 'Failed to save success story');
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
                {editingSuccessStory ? 'Edit Success Story' : 'Add Success Story'}
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
                      placeholder="Enter success story title"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={6}
                      className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Enter success story description..."
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-destructive text-sm mt-1"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Image {!editingSuccessStory && <span className="text-destructive">*</span>}
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
                        {!editingSuccessStory && !values.image && (
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
                      disabled={isSubmitting || (!editingSuccessStory && !values.image)}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {editingSuccessStory ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>{editingSuccessStory ? 'Update' : 'Create'} Success Story</>
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

export default SuccessStoryModal;
