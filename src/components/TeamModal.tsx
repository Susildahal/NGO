'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Check } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { getFileUrl } from '@/utils/fileHelpers';

interface SocialMedia {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

interface TeamMember {
  _id?: string;
  id?: string;
  name: string;
  role: string;
  description: string;
  photo: string;
  socialMedia: SocialMedia;
  createdAt?: string;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember: TeamMember | null;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  role: Yup.string()
    .required('Role is required')
    .min(2, 'Role must be at least 2 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  socialMedia: Yup.object({
    facebook: Yup.string().url('Must be a valid URL'),
    twitter: Yup.string().url('Must be a valid URL'),
    linkedin: Yup.string().url('Must be a valid URL'),
    instagram: Yup.string().url('Must be a valid URL'),
  }),
});

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, editingMember }) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      role: '',
      description: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setUploading(true);

        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('role', values.role);
        formData.append('description', values.description);
        
        // Append social media as JSON string
        formData.append('socialMedia', JSON.stringify(values.socialMedia));

        // Append photo if selected
        if (photoFile) {
          formData.append('photo', photoFile);
        }

        if (editingMember) {
          // Update existing member
          const memberId = editingMember.id || editingMember._id;
          await axiosInstance.put(`/team/${memberId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success('Team member updated successfully!');
        } else {
          // Create new member
          await axiosInstance.post('/team', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success('Team member added successfully!');
        }

        handleClose();
      } catch (error: any) {
        console.error('Error saving team member:', error);
        toast.error(error.response?.data?.message || 'Failed to save team member');
      } finally {
        setUploading(false);
      }
    },
  });

  // Reset form when modal opens/closes or editingMember changes
  useEffect(() => {
    if (isOpen) {
      if (editingMember) {
        // Parse socialMedia if it's an array with JSON string
        let socialMedia = editingMember.socialMedia || {};
        if (Array.isArray(socialMedia) && socialMedia.length > 0 && typeof socialMedia[0] === 'string') {
          try {
            socialMedia = JSON.parse(socialMedia[0]);
          } catch (e) {
            console.error('Error parsing socialMedia:', e);
            socialMedia = {};
          }
        }
        
        formik.setValues({
          name: editingMember.name || '',
          role: editingMember.role || '',
          description: editingMember.description || '',
          socialMedia: {
            facebook: socialMedia?.facebook || '',
            twitter: socialMedia?.twitter || '',
            linkedin: socialMedia?.linkedin || '',
            instagram: socialMedia?.instagram || '',
          },
        });
        setPhotoPreview(editingMember.photo || '');
        setPhotoFile(null);
      } else {
        formik.resetForm();
        setPhotoPreview('');
        setPhotoFile(null);
      }
    }
  }, [isOpen, editingMember]);

  const handleClose = () => {
    formik.resetForm();
    setPhotoPreview('');
    setPhotoFile(null);
    onClose();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-foreground">
              {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Photo
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview.startsWith('blob:') || photoPreview.startsWith('data:')
                        ? photoPreview
                        : getFileUrl(photoPreview, 'image')}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 cursor-pointer transition-colors"
                  >
                    <Upload size={16} />
                    Choose Photo
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...formik.getFieldProps('name')}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter member name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-destructive mt-1">{formik.errors.name}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                Role <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="role"
                {...formik.getFieldProps('role')}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g. Executive Director, Program Manager"
              />
              {formik.touched.role && formik.errors.role && (
                <p className="text-sm text-destructive mt-1">{formik.errors.role}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                {...formik.getFieldProps('description')}
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="Brief description about the team member"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-destructive mt-1">{formik.errors.description}</p>
              )}
            </div>

            {/* Social Media Links */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Social Media Links</h3>
              <div className="space-y-3">
                {/* Facebook */}
                <div>
                  <label htmlFor="facebook" className="block text-xs text-muted-foreground mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    {...formik.getFieldProps('socialMedia.facebook')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    placeholder="https://facebook.com/username"
                  />
                  {formik.touched.socialMedia?.facebook && formik.errors.socialMedia?.facebook && (
                    <p className="text-xs text-destructive mt-1">{formik.errors.socialMedia.facebook}</p>
                  )}
                </div>

                {/* Twitter */}
                <div>
                  <label htmlFor="twitter" className="block text-xs text-muted-foreground mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    id="twitter"
                    {...formik.getFieldProps('socialMedia.twitter')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    placeholder="https://twitter.com/username"
                  />
                  {formik.touched.socialMedia?.twitter && formik.errors.socialMedia?.twitter && (
                    <p className="text-xs text-destructive mt-1">{formik.errors.socialMedia.twitter}</p>
                  )}
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedin" className="block text-xs text-muted-foreground mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    {...formik.getFieldProps('socialMedia.linkedin')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                  {formik.touched.socialMedia?.linkedin && formik.errors.socialMedia?.linkedin && (
                    <p className="text-xs text-destructive mt-1">{formik.errors.socialMedia.linkedin}</p>
                  )}
                </div>

                {/* Instagram */}
                <div>
                  <label htmlFor="instagram" className="block text-xs text-muted-foreground mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    {...formik.getFieldProps('socialMedia.instagram')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    placeholder="https://instagram.com/username"
                  />
                  {formik.touched.socialMedia?.instagram && formik.errors.socialMedia?.instagram && (
                    <p className="text-xs text-destructive mt-1">{formik.errors.socialMedia.instagram}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !formik.isValid}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingMember ? 'Update' : 'Add'} Member
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamModal;
