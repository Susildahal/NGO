'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Info } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { getFileUrl } from '@/utils/fileHelpers';
import { Pagination } from '@/components/Pagination';
import BlogModal from '../../../components/BlogModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Blog {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  image: string;
  authorName: string;
  extraInfo: string[];
  createdAt?: string;
}

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

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
      fetchBlogs();
    }
  }, [mounted, currentPage, itemsPerPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/blog', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      console.log('Blog response:', response.data);

      const data = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || {};

      if (Array.isArray(data)) {
        setBlogs(data);
        setTotalPages(pagination.totalPages || Math.ceil(data.length / itemsPerPage) || 1);
        setTotalItems(pagination.total || pagination.totalCount || data.length || 0);
      } else {
        setBlogs([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
      toast.error(error.response?.data?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    const blogId = blogToDelete.id || blogToDelete._id;

    try {
      await axiosInstance.delete(`/blog/${blogId}`);
      toast.success('Blog deleted successfully!');
      setDeleteModalOpen(false);
      setBlogToDelete(null);
      await fetchBlogs();
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      toast.error(error.response?.data?.message || 'Failed to delete blog');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setBlogToDelete(null);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    fetchBlogs();
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Blog Management</h1>
              <p className="text-muted-foreground">Manage your organization's blog posts</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Add Blog Post
            </motion.button>
          </div>
        </motion.div>

        {/* Blog Table */}
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
                    <TableHead>Author</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Extra Info</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(blogs) || blogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        {loading ? 'Loading...' : 'No blog posts found. Add your first blog post to get started!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    blogs.map((blog) => {
                      const blogId = blog.id || blog._id;
                      return (
                        <TableRow key={blogId}>
                          {/* Image */}
                          <TableCell>
                            <div className="w-10 h-12 rounded-lg overflow-hidden bg-muted">
                              {blog.image ? (
                                <img
                                  src={getFileUrl(blog.image, 'image')}
                                  alt={blog.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                  <span className="text-xl font-bold text-primary">
                                    {blog.title.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Title */}
                          <TableCell className="font-medium max-w-xs">
                            <div className="line-clamp-2">{blog.title}</div>
                          </TableCell>

                          {/* Author */}
                          <TableCell className="text-muted-foreground">
                            {blog.authorName}
                          </TableCell>

                          {/* Description */}
                          <TableCell className="max-w-md">
                            <div className="line-clamp-2 text-sm text-muted-foreground">
                              {blog.description}
                            </div>
                          </TableCell>

                          {/* Extra Info */}
                          <TableCell className="max-w-xs">
                            {blog.extraInfo && blog.extraInfo.length > 0 ? (
                              <div className="space-y-1">
                                {blog.extraInfo.slice(0, 2).map((info, index) => (
                                  info && info.trim() && (
                                    <div
                                      key={index}
                                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md line-clamp-1"
                                    >
                                      {info}
                                    </div>
                                  )
                                ))}
                                {blog.extraInfo.filter(info => info && info.trim()).length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{blog.extraInfo.filter(info => info && info.trim()).length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">No extra info</span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(blog)}
                                className="p-2 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteClick(blog)}
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
        {!loading && blogs.length > 0 && (
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

      {/* Blog Modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingBlog={editingBlog}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && blogToDelete && (
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
                  <h3 className="text-xl font-bold text-foreground mb-2">Delete Blog Post</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Are you sure you want to delete <span className="font-semibold text-foreground">{blogToDelete.title}</span>?
                    This action cannot be undone.
                  </p>

                  {/* Blog Info */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-3">
                      {blogToDelete.image ? (
                        <img
                          src={getFileUrl(blogToDelete.image, 'image')}
                          alt={blogToDelete.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {blogToDelete.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1">{blogToDelete.title}</p>
                        <p className="text-sm text-muted-foreground">by {blogToDelete.authorName}</p>
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

export default BlogPage;
