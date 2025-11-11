// 'use client';

// import { useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { setItems, deleteItem, openModal, setLoading } from '@/store/slices/carouselSlice';
// import { CarouselModal } from '@/components/CarouselModal';
// import toast from 'react-hot-toast';
// import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react';
// import type { CarouselItem } from '@/store/slices/carouselSlice';

// export default function CarouselPage() {
//   const dispatch = useAppDispatch();
//   const { items, loading } = useAppSelector((state) => state.carousel);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [itemToDelete, setItemToDelete] = useState<string | null>(null);

//   // Fetch carousel items on mount
//   useEffect(() => {
//     fetchCarouselItems();
//   }, []);

//   const fetchCarouselItems = async () => {
//     dispatch(setLoading(true));
//     try {
//       // TODO: Replace with your actual API endpoint
//       const response = await fetch('/api/carousel');
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch carousel items');
//       }

//       const data = await response.json();
//       dispatch(setItems(data));
//     } catch (error) {
//       console.error('Error fetching carousel items:', error);
//       toast.error('Failed to load carousel items');
//       // Set mock data for demo
//       dispatch(setItems([]));
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       // TODO: Replace with your actual API endpoint
//       const response = await fetch(`/api/carousel/${id}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete carousel item');
//       }

//       dispatch(deleteItem(id));
//       toast.success('Carousel item deleted successfully!');
//     } catch (error) {
//       console.error('Error deleting carousel item:', error);
//       toast.error('Failed to delete carousel item');
//     } finally {
//       setDeleteDialogOpen(false);
//       setItemToDelete(null);
//     }
//   };

//   const confirmDelete = (id: string) => {
//     setItemToDelete(id);
//     setDeleteDialogOpen(true);
//   };

//   const handleEdit = (item: CarouselItem) => {
//     dispatch(openModal(item));
//   };

//   const handleAddNew = () => {
//     dispatch(openModal(null));
//   };

//   // Filter items based on search query
//   const filteredItems = items.filter(
//     (item) =>
//       item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.description.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen dark:bg-gray-900 ">
//       <div className="mx-auto ">
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between flex-wrap gap-4">
//               <div>
//                 <CardTitle className="text-xl">Carousel Management</CardTitle>
//                 <CardDescription className="mt-2">
//                   Manage carousel items with full  operations
//                 </CardDescription>
//               </div>
//               <Button onClick={handleAddNew} className="gap-2">
//                 <Plus className="w-4 h-4" />
//                 Add New Item
//               </Button>
//             </div>
//           </CardHeader>

//           <CardContent className="space-y-6">
//             {/* Search Bar */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//               <Input
//                 placeholder="Search by name, title, or description..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>

//             {/* Loading State */}
//             {loading && (
//               <div className="flex items-center justify-center py-12">
//                 <div className="text-center">
//                   <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                   <p className="text-muted-foreground">Loading carousel items...</p>
//                 </div>
//               </div>
//             )}

//             {/* Empty State */}
//             {!loading && filteredItems.length === 0 && (
//               <div className="text-center py-12">
//                 <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold mb-2">No carousel items found</h3>
//                 <p className="text-muted-foreground mb-4">
//                   {searchQuery
//                     ? 'No items match your search criteria'
//                     : 'Get started by adding your first carousel item'}
//                 </p>
//                 {!searchQuery && (
//                   <Button onClick={handleAddNew} className="gap-2">
//                     <Plus className="w-4 h-4" />
//                     Add First Item
//                   </Button>
//                 )}
//               </div>
//             )}

//             {/* Carousel Items Grid */}
//             {!loading && filteredItems.length > 0 && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredItems.map((item) => (
//                   <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
//                     <div className="relative h-48 bg-muted">
//                       {item.photo ? (
//                         <img
//                           src={item.photo}
//                           alt={item.title}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center">
//                           <ImageIcon className="w-12 h-12 text-muted-foreground" />
//                         </div>
//                       )}
//                     </div>
//                     <CardContent className="p-4">
//                       <div className="space-y-2 mb-4">
//                         <div className="flex items-start justify-between gap-2">
//                           <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
//                         </div>
//                         <p className="text-sm text-muted-foreground font-medium">{item.name}</p>
//                         <p className="text-sm text-muted-foreground line-clamp-2">
//                           {item.description}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button
//                           onClick={() => handleEdit(item)}
//                           variant="outline"
//                           size="sm"
//                           className="flex-1 gap-2"
//                         >
//                           <Edit className="w-4 h-4" />
//                           Edit
//                         </Button>
//                         <Button
//                           onClick={() => confirmDelete(item.id)}
//                           variant="destructive"
//                           size="sm"
//                           className="flex-1 gap-2"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                           Delete
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}

//             {/* Items Count */}
//             {!loading && filteredItems.length > 0 && (
//               <div className="text-center text-sm text-muted-foreground pt-4 border-t">
//                 Showing {filteredItems.length} of {items.length} item(s)
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Modal */}
//       <CarouselModal />

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the carousel item.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel onClick={() => setItemToDelete(null)}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => itemToDelete && handleDelete(itemToDelete)}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
 import React from 'react'
 
 const page = () => {
   return (
     <div>
       
     </div>
   )
 }
 
 export default page
 
