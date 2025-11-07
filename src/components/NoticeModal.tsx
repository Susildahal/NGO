'use client';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeModal, createNotice, updateNotice } from '@/store/slices/noticSlicer';
import toast from 'react-hot-toast';
import { AlertCircle, Upload, X, FileText } from 'lucide-react';
import { getFileUrl } from '@/utils/fileHelpers';

// Validation schema
const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must not exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must not exceed 500 characters'),
  fileType: z.enum(['image', 'pdf']),
  photo: z.string().optional(),  // For image files
  file: z.string().optional(),   // For PDF files
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'inactive']),
}).refine((data) => {
  // Ensure at least one file is provided based on fileType
  if (data.fileType === 'image') {
    return !!data.photo || data.photo === 'file-selected';
  } else {
    return !!data.file;
  }
}, {
  message: 'File is required',
  path: ['file'],
});

type NoticeFormData = z.infer<typeof noticeSchema>;

export function NoticeModal() {
  const dispatch = useAppDispatch();
  const { isModalOpen, editingItem } = useAppSelector((state) => state.notic);
  const [filePreview, setFilePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const formik = useFormik<NoticeFormData>({
    initialValues: {
      title: '',
      description: '',
      fileType: 'image',
      photo: '',
      file: '',
      category: '',
      status: 'active',
    },
    validationSchema: toFormikValidationSchema(noticeSchema),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Create FormData for binary file upload
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('fileType', values.fileType);
        formData.append('category', values.category);
        formData.append('status', values.status);

        // Add file to FormData based on type
        if (values.fileType === 'image' && selectedFile) {
          // For images, send the actual file (binary)
          formData.append('photo', selectedFile);
        } else if (values.fileType === 'pdf' && values.file) {
          // For PDFs, send the URL as text
          formData.append('file', values.file);
        }

        if (editingItem) {
          // Update existing notice
          await dispatch(updateNotice({
            id: editingItem.id,
            formData,
          })).unwrap();
          toast.success('Notice updated successfully!');
        } else {
          // Create new notice
          await dispatch(createNotice(formData)).unwrap();
          toast.success('Notice added successfully!');
        }

        resetForm();
        setSelectedFile(null);
        setFilePreview('');
        dispatch(closeModal());
      } catch (error) {
        console.error('Error saving notice:', error);
        toast.error('Failed to save notice');
      }
    },
  });

  // Load editing data
  useEffect(() => {
    if (editingItem) {
      formik.setValues({
        title: editingItem.title,
        description: editingItem.description,
        fileType: editingItem.fileType,
        photo: editingItem.photo || '',
        file: editingItem.file || '',
        category: editingItem.category,
        status: editingItem.status,
      });
      
      // Set preview URL using helper function
      const fileUrl = editingItem.fileType === 'image' 
        ? (editingItem.photo || '') 
        : (editingItem.file || '');
      
      if (fileUrl) {
        setFilePreview(getFileUrl(fileUrl, editingItem.fileType));
      }
    } else {
      formik.resetForm();
      setFilePreview('');
      setSelectedFile(null);
    }
  }, [editingItem]);

  const handleClose = () => {
    // Cleanup preview URL if it's an object URL
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    formik.resetForm();
    setFilePreview('');
    setSelectedFile(null);
    dispatch(closeModal());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = formik.values.fileType;
      
      // Validate file type
      if (fileType === 'image' && !file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB for images)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);

      // Create preview URL for display only (not for upload)
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      
      // Set a placeholder value to pass validation
      formik.setFieldValue('photo', 'file-selected');
    }
  };

  const handleRemoveFile = () => {
    // Cleanup preview URL if it's an object URL
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview('');
    setSelectedFile(null);
    formik.setFieldValue('photo', '');
    formik.setFieldValue('file', '');
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFileType = e.target.value as 'image' | 'pdf';
    formik.setFieldValue('fileType', newFileType);
    // Clear file when changing type
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview('');
    setSelectedFile(null);
    formik.setFieldValue('photo', '');
    formik.setFieldValue('file', '');
  };

  const handlePdfUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    formik.setFieldValue('file', url);
    setFilePreview(url);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Notice' : 'Add New Notice'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the notice. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Important Meeting Announcement"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.errors.title && formik.touched.title ? 'border-destructive' : ''}
            />
            {formik.errors.title && formik.touched.title && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {formik.errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the notice in detail..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={4}
              className={formik.errors.description && formik.touched.description ? 'border-destructive' : ''}
            />
            {formik.errors.description && formik.touched.description && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {formik.errors.description}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {formik.values.description.length}/500 characters
            </p>
          </div>

          {/* File Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="fileType">File Type * <span className='text-slate-800'>(pdf may recommend )</span></Label>
            <select
              id="fileType"
              name="fileType"
              value={formik.values.fileType}
              onChange={handleFileTypeChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background border-input"
            >
              <option value="image">Image (PNG, JPG, GIF)</option>
              <option value="pdf">PDF Document</option>
            </select>
          </div>

          {/* File Upload - Conditional based on fileType */}
          <div className="space-y-2">
            {formik.values.fileType === 'image' ? (
              <>
                <Label htmlFor="file">Upload Image *</Label>
                
                {!filePreview ? (
                  <div className="border-2 border-dashed border-border rounded-md p-8 text-center hover:border-primary transition-colors">
                    <input
                      id="file"
                      name="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-12 h-12 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-md border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <Label htmlFor="pdfUrl">Google Drive PDF URL *</Label>
                <Input
                  id="pdfUrl"
                  name="pdfUrl"
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formik.values.file}
                  onChange={handlePdfUrlChange}
                  onBlur={formik.handleBlur}
                  className={formik.errors.file && formik.touched.file ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Paste the shareable Google Drive link to your PDF document
                </p>
                {formik.values.file && (
                  <div className="mt-2 p-4 bg-muted rounded-md flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">PDF Document URL Set</p>
                      <p className="text-xs text-muted-foreground truncate">{formik.values.file}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(formik.values.file, '_blank')}
                    >
                      Test Link
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {formik.errors.file && formik.touched.file && !filePreview && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {formik.errors.file}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g., General, Event, Meeting"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.errors.category && formik.touched.category ? 'border-destructive' : ''}
              />
              {formik.errors.category && formik.touched.category && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {formik.errors.category}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background ${
                  formik.errors.status && formik.touched.status ? 'border-destructive' : 'border-input'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {formik.errors.status && formik.touched.status && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {formik.errors.status}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {formik.isSubmitting
                ? 'Saving...'
                : editingItem
                ? 'Update Notice'
                : 'Add Notice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
