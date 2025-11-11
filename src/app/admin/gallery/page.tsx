'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, MapPin } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { getFileUrl } from '@/utils/fileHelpers';
import { Pagination } from '@/components/Pagination';
import GalleryModal from '../../../components/GalleryModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Gallery {
  _id?: string;
  id?: string;
  title: string;
  subtitle: string;
  address?: string;
  image: string;
  createdAt?: string;
}

const GalleryPage = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchGalleries();
    }
  }, [mounted, currentPage, itemsPerPage]);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/gallery', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      console.log('Gallery response:', response.data);

      const data = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || {};

      if (Array.isArray(data)) {
        setGalleries(data);
        setTotalPages(pagination.totalPages || Math.ceil(data.length / itemsPerPage) || 1);
        setTotalItems(pagination.total || pagination.totalCount || data.length || 0);
      } else {
        setGalleries([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Error fetching galleries:', error);
      setGalleries([]);
      toast.error(error.response?.data?.message || 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (gallery: Gallery) => {
    setGalleryToDelete(gallery);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!galleryToDelete) return;

    const galleryId = galleryToDelete.id || galleryToDelete._id;

    try {
      await axiosInstance.delete(`/gallery/${galleryId}`);
      toast.success('Gallery item deleted successfully!');
      setDeleteModalOpen(false);
      setGalleryToDelete(null);
      await fetchGalleries();
    } catch (error: any) {
      console.error('Error deleting gallery:', error);
      toast.error(error.response?.data?.message || 'Failed to delete gallery item');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setGalleryToDelete(null);
  };

  const handleEdit = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingGallery(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGallery(null);
    fetchGalleries();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen duration-300">
      <div className="mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Gallery Management</h1>
              <p className="text-muted-foreground">Manage your organization's gallery items</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Add Gallery Item
            </motion.button>
          </div>
        </motion.div>

        {/* Gallery Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl overflow-hidden shadow-lg mb-8"
        >
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(galleries) || galleries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        {loading ? 'Loading...' : 'No gallery items found. Add your first gallery item to get started!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    galleries.map((gallery) => {
                      const galleryId = gallery.id || gallery._id;
                      return (
                        <TableRow key={galleryId}>
                          {/* Image */}
                          <TableCell>
                            <div className="w-10 h-12 rounded-lg overflow-hidden bg-muted">
                              {gallery.image ? (
                                <img
                                  src={getFileUrl(gallery.image, 'image')}
                                  alt={gallery.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                  <span className="text-xl font-bold text-primary">
                                    {gallery.title.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Title */}
                          <TableCell className="font-medium max-w-xs">
                            <div className="line-clamp-2">{gallery.title}</div>
                          </TableCell>

                          {/* Subtitle */}
                          <TableCell className="max-w-md">
                            <div className="line-clamp-2 text-sm text-muted-foreground">
                              {gallery.subtitle}
                            </div>
                          </TableCell>

                          {/* Address */}
                          <TableCell className="text-muted-foreground">
                            {gallery.address ? (
                              <div className="flex items-center gap-1">
                                <MapPin size={14} className="flex-shrink-0" />
                                <span className="line-clamp-1">{gallery.address}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">No address</span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(gallery)}
                                className="p-2 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteClick(gallery)}
                                className="p-2 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {!loading && galleries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </motion.div>
        )}
      </div>

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingGallery={editingGallery}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && galleryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Delete Gallery Item</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Are you sure you want to delete <span className="font-semibold text-foreground">{galleryToDelete.title}</span>?
                    This action cannot be undone.
                  </p>

                  {/* Gallery Info */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-3">
                      {galleryToDelete.image ? (
                        <img
                          src={getFileUrl(galleryToDelete.image, 'image')}
                          alt={galleryToDelete.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {galleryToDelete.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground line-clamp-1">{galleryToDelete.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{galleryToDelete.subtitle}</p>
                        {galleryToDelete.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {galleryToDelete.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={cancelDelete}
                      className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
