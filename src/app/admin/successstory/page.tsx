'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { getFileUrl } from '@/utils/fileHelpers';
import { Pagination } from '@/components/Pagination';
import SuccessStoryModal from '../../../components/SuccessStoryModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SuccessStory {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  image: string;
  createdAt?: string;
}

const SuccessStoryPage = () => {
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSuccessStory, setEditingSuccessStory] = useState<SuccessStory | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successStoryToDelete, setSuccessStoryToDelete] = useState<SuccessStory | null>(null);

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
      fetchSuccessStories();
    }
  }, [mounted, currentPage, itemsPerPage]);

  const fetchSuccessStories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/successstory', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      console.log('Success Story response:', response.data);

      const data = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || {};

      if (Array.isArray(data)) {
        setSuccessStories(data);
        setTotalPages(pagination.totalPages || Math.ceil(data.length / itemsPerPage) || 1);
        setTotalItems(pagination.total || pagination.totalCount || data.length || 0);
      } else {
        setSuccessStories([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Error fetching success stories:', error);
      setSuccessStories([]);
      toast.error(error.response?.data?.message || 'Failed to load success stories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (successStory: SuccessStory) => {
    setSuccessStoryToDelete(successStory);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!successStoryToDelete) return;

    const successStoryId = successStoryToDelete.id || successStoryToDelete._id;

    try {
      await axiosInstance.delete(`/successstory/${successStoryId}`);
      toast.success('Success story deleted successfully!');
      setDeleteModalOpen(false);
      setSuccessStoryToDelete(null);
      await fetchSuccessStories();
    } catch (error: any) {
      console.error('Error deleting success story:', error);
      toast.error(error.response?.data?.message || 'Failed to delete success story');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setSuccessStoryToDelete(null);
  };

  const handleEdit = (successStory: SuccessStory) => {
    setEditingSuccessStory(successStory);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingSuccessStory(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSuccessStory(null);
    fetchSuccessStories();
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Success Story Management</h1>
              <p className="text-muted-foreground">Manage your organization's success stories</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Add Success Story
            </motion.button>
          </div>
        </motion.div>

        {/* Success Story Table */}
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
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(successStories) || successStories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        {loading ? 'Loading...' : 'No success stories found. Add your first success story to get started!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    successStories.map((successStory) => {
                      const successStoryId = successStory.id || successStory._id;
                      return (
                        <TableRow key={successStoryId}>
                          {/* Image */}
                          <TableCell>
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                              {successStory.image ? (
                                <img
                                  src={getFileUrl(successStory.image, 'image')}
                                  alt={successStory.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                  <span className="text-xl font-bold text-primary">
                                    {successStory.title.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Title */}
                          <TableCell className="font-medium max-w-xs">
                            <div className="line-clamp-2">{successStory.title}</div>
                          </TableCell>

                          {/* Description */}
                          <TableCell className="max-w-md">
                            <div className="line-clamp-3 text-sm text-muted-foreground">
                              {successStory.description}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(successStory)}
                                className="p-2 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteClick(successStory)}
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
        {!loading && successStories.length > 0 && (
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

      {/* Success Story Modal */}
      <SuccessStoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingSuccessStory={editingSuccessStory}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && successStoryToDelete && (
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
                  <h3 className="text-xl font-bold text-foreground mb-2">Delete Success Story</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Are you sure you want to delete <span className="font-semibold text-foreground">{successStoryToDelete.title}</span>?
                    This action cannot be undone.
                  </p>

                  {/* Success Story Info */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-3">
                      {successStoryToDelete.image ? (
                        <img
                          src={getFileUrl(successStoryToDelete.image, 'image')}
                          alt={successStoryToDelete.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {successStoryToDelete.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground line-clamp-1">{successStoryToDelete.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{successStoryToDelete.description}</p>
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

export default SuccessStoryPage;
