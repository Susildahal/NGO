'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setItems, deleteItem, openModal, setLoading } from '@/store/slices/noticSlicer';
import { NoticeModal } from '@/components/NoticeModal';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, Bell, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
import type { NoticItem } from '@/store/slices/noticSlicer';

export default function NoticePage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.notic);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch notice items on mount
  useEffect(() => {
    fetchNoticeItems();
  }, []);
  const fetchNoticeItems = async () => {
    dispatch(setLoading(true));
    try {
      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/notice');
      
      // if (!response.ok) {
      //   throw new Error('Failed to fetch notice items');
      // }

      // const data = await response.json();
      // dispatch(setItems(data));

      // Mock data for demo
      dispatch(setItems([]));
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to load notices');
      // Set mock data for demo
      dispatch(setItems([]));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(`/api/carousel/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete carousel item');
      }

      dispatch(deleteItem(id));
      toast.success('Notice deleted successfully!');
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (item: NoticItem) => {
    dispatch(openModal(item));
  };

  const handleAddNew = () => {
    dispatch(openModal(null));
  };

  // Filter items based on search query and status
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Notice Management</CardTitle>
                  <CardDescription className="mt-1">
                    Manage and organize all notices and announcements
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleAddNew} className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add Notice
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notices by title, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground font-medium">Loading notices...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredItems.length === 0 && (
              <div className="text-center py-16 bg-muted/20 rounded-lg border-2 border-dashed">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No notices found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters to find what you\'re looking for'
                    : 'Get started by creating your first notice announcement'}
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Button onClick={handleAddNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create First Notice
                  </Button>
                )}
              </div>
            )}

            {/* Table View */}
            {!loading && filteredItems.length > 0 && (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[250px]">Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[150px]">Category</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[120px] text-center">File</TableHead>
                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/50">
                          {/* File Type */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.fileType === 'image' ? (
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-blue-600" />
                                  <span className="text-xs font-medium text-blue-600">Image</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-purple-600" />
                                  <span className="text-xs font-medium text-purple-600">PDF</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Title */}
                          <TableCell>
                            <div className="font-medium line-clamp-1" title={item.title}>
                              {item.title}
                            </div>
                          </TableCell>

                          {/* Description */}
                          <TableCell>
                            <div className="text-sm text-muted-foreground line-clamp-2" title={item.description}>
                              {item.description}
                            </div>
                          </TableCell>

                          {/* Category */}
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {item.category}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.status === 'active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {item.status}
                            </span>
                          </TableCell>

                          {/* File Preview/Link */}
                          <TableCell className="text-center">
                            {item.fileType === 'image' ? (
                              <button
                                onClick={() => window.open(item.file, '_blank')}
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <ImageIcon className="w-4 h-4" />
                                View
                              </button>
                            ) : (
                              <button
                                onClick={() => window.open(item.file, '_blank')}
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open
                              </button>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => handleEdit(item)}
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => confirmDelete(item.id)}
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Items Count */}
                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-lg">
                  <div>
                    Showing <span className="font-semibold text-foreground">{filteredItems.length}</span> of{' '}
                    <span className="font-semibold text-foreground">{items.length}</span> notice(s)
                  </div>
                  {(searchQuery || filterStatus !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <NoticeModal />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

