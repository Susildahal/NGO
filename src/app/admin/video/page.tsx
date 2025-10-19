'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit2, Plus, Eye, ArrowUpDown ,Loader2 } from 'lucide-react';
import { toast } from '@/utils/toast';
import { Pagination } from '@/components/Pagination';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  type: string;
  date:string
}

export default function VideoDashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // desc = latest first
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    type: '',
    date: Date.now().toString(),
  });
  const [submitting, setSubmitting] = useState(false);

 

const fetchVideos = async () => {
  setLoading(true);
  try {
    const videosQuery = query(collection(db, 'videos'), orderBy('updatedAt', sortOrder));
    const querySnapshot = await getDocs(videosQuery);
    const videoList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[];
    setVideos(videoList);
    setCurrentPage(1); // Reset to first page when sorting changes
  } catch (error) {
    console.error('Error fetching videos:', error);
    toast.error('Failed to load videos');
  }
  setLoading(false);
};

useEffect(() => {
  fetchVideos();
}, [sortOrder, itemsPerPage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrUpdate = async () => {
  // Validation checks
  if (!formData.title || !formData.description || !formData.youtubeUrl || !formData.type) {
    toast.error('Please fill in all fields');
    return;
  }

  if (formData.title.trim().length === 0) {
    toast.error('Title cannot be empty');
    return;
  }

  if (formData.description.length < 10) {
    toast.error('Description must be at least 10 characters');
    return;
  }

  if (formData.description.length > 200) {
    toast.error('Description cannot exceed 200 characters');
    return;
  }

  if (formData.type.trim().length === 0) {
    toast.error('Type cannot be empty');
    return;
  }

  if (formData.youtubeUrl.trim().length === 0) {
    toast.error('YouTube URL cannot be empty');
    return;
  }

  // Validate YouTube URL format
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
  if (!youtubeRegex.test(formData.youtubeUrl)) {
    toast.error('Please enter a valid YouTube URL');
    return;
  }

  try {
      setSubmitting(true);
    if (editingId) {
      
      // When updating, we only want to set the 'updatedAt' timestamp
      // and update the fields from formData.
      await updateDoc(doc(db, 'videos', editingId), {
        ...formData, // Spread existing form data
        updatedAt: serverTimestamp(), // Set or update the updatedAt timestamp
      });
      toast.success('Video updated successfully');
    } else {
      // When adding a new document, set both 'createdAt' and 'updatedAt'
      await addDoc(collection(db, 'videos'), {
        ...formData, // Spread existing form data
        createdAt: serverTimestamp(), // Set the creation timestamp
        updatedAt: serverTimestamp(), // Set the initial update timestamp
      });
      toast.success('Video added successfully');
    }
    setFormData({ title: '', description: '', youtubeUrl: '', type: '', date: '' }); // Reset form
    setEditingId(null);
    setOpen(false);
    fetchVideos(); // Re-fetch videos to show the updated/new data
  } catch (error) {
    console.error('Error saving video:', error);
    toast.error('Error saving video');
  }finally{
   
        setSubmitting(false);

  
  }
};
  const handleDeleteClick = (id: string) => {
    setDeleteVideoId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteVideoId) return;

    try {
      await deleteDoc(doc(db, 'videos', deleteVideoId));
      toast.success('Video deleted successfully');
      setDeleteDialogOpen(false);
      setDeleteVideoId(null);
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Error deleting video');
    }
  };

  const handleEdit = (video: Video) => {
    setEditingId(video.id);
    setFormData({
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
      type: video.type,
      date: video.date,
    });
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ title: '', description: '', youtubeUrl: '', type: '', date: '' });
      setEditingId(null);
    }
    setOpen(newOpen);
  };

  const extractYoutubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYoutubeThumbnail = (youtubeUrl: string) => {
    const youtubeId = extractYoutubeId(youtubeUrl);
    return youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
      : null;
  };

  // Pagination logic
  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVideos = videos.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Video Management
            </h1>
            <p className="text-muted-foreground">Manage your video content</p>
          </div>

          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="gap-2"
              title={sortOrder === 'desc' ? 'Latest first' : 'Oldest first'}
            >
              <ArrowUpDown size={18} />
              {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  Add Video
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Video' : 'Add New Video'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the video details below
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-foreground text-sm font-medium mb-1 block">
                    Title
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter video title"
                    className="bg-muted text-foreground border-input"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-foreground text-sm font-medium">
                      Description
                    </label>
                    <span className={`text-xs font-medium ${
                      formData.description.length > 200 ? 'text-red-600' :
                      formData.description.length < 10 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {formData.description.length}/200
                    </span>
                  </div>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        handleInputChange(e);
                      }
                    }}
                    placeholder="Enter video description (min 10 chars, max 200 chars)"
                    className={`bg-muted text-foreground border-input ${
                      formData.description.length > 200 ? 'border-red-500' :
                      formData.description.length < 10 && formData.description.length > 0 ? 'border-yellow-500' :
                      'border-input'
                    }`}
                    rows={4}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length < 10 && formData.description.length > 0 ? (
                      <span className="text-yellow-600">Minimum 10 characters required</span>
                    ) : null}
                  </p>
                </div>
                <div>
                  <label className="text-foreground text-sm font-medium mb-1 block">
                    Type
                  </label>
                  <Input
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Enter video type"
                    className="bg-muted text-foreground border-input"
                  />
                </div>
                <div>
                  <label className="text-foreground text-sm font-medium mb-1 block">
                    YouTube URL
                  </label>
                  <Input
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-muted text-foreground border-input"
                  />
                </div>
                {editingId && (
                  <div>
                    <div>
                      {getYoutubeThumbnail(formData.youtubeUrl) && (
                        <img
                          src={getYoutubeThumbnail(formData.youtubeUrl)!}
                          alt={formData.title}
                          className="w-30 h-30 object-cover rounded"
                        />
                      )}
                    </div>

                  </div>
                )}
                <div className="flex gap-2 pt-4">
<Button onClick={handleAddOrUpdate} className="flex-1" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}                    
                    {editingId ? 'Update' : 'Add'} Video
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Video</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this video? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">No videos yet. Add one to get started!</p>
          </div>
        ) : (
          <div className=" overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-foreground">Thumbnail</TableHead>
                  <TableHead className="text-foreground">Title</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Description</TableHead>
                  <TableHead className="text-foreground">YouTube URL</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVideos.map((video) => (
                  <TableRow
                    key={video.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      {getYoutubeThumbnail(video.youtubeUrl) && (
                        <img
                          src={getYoutubeThumbnail(video.youtubeUrl)!}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-foreground max-w-xs truncate">
                      {video.title}
                    </TableCell>
                    <TableCell className="font-medium text-foreground max-w-xs truncate">
                      {video.type || 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {video.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        <p className="flex gap-3">
                          <Eye size={20} /> View on YouTube
                        </p>
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {new Date(parseInt(video.date)).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(video)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(video.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

           
          </div>
        )}
      </div>
       <div className=" ">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={videos.length}
                onItemsPerPageChange={(limit) => {
                  setItemsPerPage(limit);
                  setCurrentPage(1);
                }}
              />
            </div>
    </div>
  );
}