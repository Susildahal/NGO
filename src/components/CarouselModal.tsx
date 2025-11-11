// 'use client';

// import { useEffect, useState } from 'react';
// import { useFormik } from 'formik';
// import { z } from 'zod';
// import { toFormikValidationSchema } from 'zod-formik-adapter';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { closeModal, addItem, updateItem } from '@/store/slices/carouselSlice';
// import toast from 'react-hot-toast';
// import { Upload, X } from 'lucide-react';

// // Validation schema
// const carouselSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().min(10, 'Description must be at least 10 characters'),
//   photo: z.string().min(1, 'Photo is required'),
// });

// type CarouselFormData = z.infer<typeof carouselSchema>;

// export function CarouselModal() {
//   const dispatch = useAppDispatch();
//   const { isModalOpen, editingItem } = useAppSelector((state) => state.carousel);
//   const [imagePreview, setImagePreview] = useState<string>('');
//   const [uploading, setUploading] = useState(false);

//   const formik = useFormik<CarouselFormData>({
//     initialValues: {
//       name: '',
//       title: '',
//       description: '',
//       photo: '',
//     },
//     validationSchema: toFormikValidationSchema(carouselSchema),
//     validateOnChange: true,
//     validateOnBlur: true,
//     onSubmit: async (values, { resetForm }) => {
//       try {
//         // TODO: Replace with your actual API endpoint
//         const endpoint = editingItem
//           ? `/api/carousel/${editingItem.id}`
//           : '/api/carousel';
        
//         const method = editingItem ? 'PUT' : 'POST';

//         const response = await fetch(endpoint, {
//           method,
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(values),
//         });

//         if (!response.ok) {
//           throw new Error('Failed to save carousel item');
//         }

//         const data = await response.json();

//         if (editingItem) {
//           dispatch(updateItem({ ...data, id: editingItem.id }));
//           toast.success('Carousel item updated successfully!');
//         } else {
//           dispatch(addItem(data));
//           toast.success('Carousel item added successfully!');
//         }

//         resetForm();
//         setImagePreview('');
//         dispatch(closeModal());
//       } catch (error) {
//         console.error('Error saving carousel item:', error);
//         toast.error('Failed to save carousel item');
//       }
//     },
//   });

//   // Load editing data
//   useEffect(() => {
//     if (editingItem) {
//       formik.setValues({
//         name: editingItem.name,
//         title: editingItem.title,
//         description: editingItem.description,
//         photo: editingItem.photo,
//       });
//       setImagePreview(editingItem.photo);
//     } else {
//       formik.resetForm();
//       setImagePreview('');
//     }
//   }, [editingItem]);

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       toast.error('Please select an image file');
//       return;
//     }

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error('Image size must be less than 5MB');
//       return;
//     }

//     setUploading(true);
//     try {
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);

//       // TODO: Upload to your backend or cloud storage
//       // For now, we'll use base64 (not recommended for production)
//       // Replace this with actual upload logic
//       const formData = new FormData();
//       formData.append('file', file);

//       // Example API call (replace with your actual endpoint)
//       // const response = await fetch('/api/upload', {
//       //   method: 'POST',
//       //   body: formData,
//       // });
//       // const { url } = await response.json();
//       // formik.setFieldValue('photo', url);

//       // For demo purposes, using base64
//       reader.onloadend = () => {
//         const base64 = reader.result as string;
//         formik.setFieldValue('photo', base64);
//         setImagePreview(base64);
//       };
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       toast.error('Failed to upload image');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removeImage = () => {
//     formik.setFieldValue('photo', '');
//     setImagePreview('');
//   };

//   const handleClose = () => {
//     formik.resetForm();
//     setImagePreview('');
//     dispatch(closeModal());
//   };

//   return (
//     <Dialog open={isModalOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {editingItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
//           </DialogTitle>
//           <DialogDescription>
//             Fill in the details for the carousel item. All fields are required.
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={formik.handleSubmit} className="space-y-6 mt-4">
//           {/* Image Upload */}
//           <div className="space-y-2">
//             <Label htmlFor="photo">Photo *</Label>
//             {imagePreview ? (
//               <div className="relative">
//                 <img
//                   src={imagePreview}
//                   alt="Preview"
//                   className="w-full h-64 object-cover rounded-lg border-2 border-border"
//                 />
//                 <Button
//                   type="button"
//                   onClick={removeImage}
//                   variant="destructive"
//                   size="icon"
//                   className="absolute top-2 right-2"
//                 >
//                   <X className="w-4 h-4" />
//                 </Button>
//               </div>
//             ) : (
//               <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
//                 <input
//                   type="file"
//                   id="photo"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="hidden"
//                 />
//                 <label
//                   htmlFor="photo"
//                   className="cursor-pointer flex flex-col items-center gap-2"
//                 >
//                   <Upload className="w-12 h-12 text-muted-foreground" />
//                   <p className="text-sm text-muted-foreground">
//                     {uploading ? 'Uploading...' : 'Click to upload an image'}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     PNG, JPG, GIF up to 5MB
//                   </p>
//                 </label>
//               </div>
//             )}
//             {formik.errors.photo && formik.touched.photo && (
//               <p className="text-sm text-destructive">{formik.errors.photo}</p>
//             )}
//           </div>

//           {/* Name */}
//           <div className="space-y-2">
//             <Label htmlFor="name">Name *</Label>
//             <Input
//               id="name"
//               name="name"
//               placeholder="e.g., Featured Project"
//               value={formik.values.name}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               className={formik.errors.name && formik.touched.name ? 'border-destructive' : ''}
//             />
//             {formik.errors.name && formik.touched.name && (
//               <p className="text-sm text-destructive">{formik.errors.name}</p>
//             )}
//           </div>

//           {/* Title */}
//           <div className="space-y-2">
//             <Label htmlFor="title">Title *</Label>
//             <Input
//               id="title"
//               name="title"
//               placeholder="e.g., Empowering Communities"
//               value={formik.values.title}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               className={formik.errors.title && formik.touched.title ? 'border-destructive' : ''}
//             />
//             {formik.errors.title && formik.touched.title && (
//               <p className="text-sm text-destructive">{formik.errors.title}</p>
//             )}
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description">Description *</Label>
//             <Textarea
//               id="description"
//               name="description"
//               placeholder="Describe the carousel item..."
//               value={formik.values.description}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               rows={4}
//               className={formik.errors.description && formik.touched.description ? 'border-destructive' : ''}
//             />
//             {formik.errors.description && formik.touched.description && (
//               <p className="text-sm text-destructive">{formik.errors.description}</p>
//             )}
//             <p className="text-xs text-muted-foreground">
//               {formik.values.description.length} characters
//             </p>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3 justify-end pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleClose}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={formik.isSubmitting || !formik.isValid || uploading}
//             >
//               {formik.isSubmitting
//                 ? 'Saving...'
//                 : editingItem
//                 ? 'Update Item'
//                 : 'Add Item'}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

import React from 'react'

const CarouselModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default CarouselModal
