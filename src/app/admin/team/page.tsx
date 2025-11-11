'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { getFileUrl } from '@/utils/fileHelpers';
import { Pagination } from '@/components/Pagination';
import TeamModal from '@/components/TeamModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  
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
      fetchTeamMembers();
    }
  }, [mounted, currentPage, itemsPerPage]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/team', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      console.log('Team response:', response.data);

      const data = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || {};

      if (Array.isArray(data)) {
        // Parse socialMedia if it comes as array with JSON string
        const parsedData = data.map((member: any) => {
          let socialMedia = member.socialMedia || {};
          
          // If socialMedia is an array with a JSON string, parse it
          if (Array.isArray(socialMedia) && socialMedia.length > 0 && typeof socialMedia[0] === 'string') {
            try {
              socialMedia = JSON.parse(socialMedia[0]);
            } catch (e) {
              console.error('Error parsing socialMedia:', e);
              socialMedia = {};
            }
          }
          
          return {
            ...member,
            socialMedia,
          };
        });
        
        setTeamMembers(parsedData);
        setTotalPages(pagination.totalPages || Math.ceil(data.length / itemsPerPage) || 1);
        setTotalItems(pagination.total || data.length || 0);
      } else {
        setTeamMembers([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
      toast.error(error.response?.data?.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    const memberId = memberToDelete.id || memberToDelete._id;
    
    try {
      await axiosInstance.delete(`/team/${memberId}`);
      toast.success('Team member deleted successfully!');
      setDeleteModalOpen(false);
      setMemberToDelete(null);
      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      toast.error(error.response?.data?.message || 'Failed to delete team member');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    fetchTeamMembers();
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
              <p className="text-muted-foreground">Manage your organization's team members</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Add Team Member
            </motion.button>
          </div>
        </motion.div>

        {/* Team Table */}
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
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Social Media</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!Array.isArray(teamMembers) || teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        {loading ? 'Loading...' : 'No team members found. Add your first team member to get started!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => {
                      const memberId = member.id || member._id;
                      return (
                        <TableRow key={memberId}>
                          {/* Photo */}
                          <TableCell>
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                              {member.photo ? (
                                <img
                                  src={getFileUrl(member.photo, 'image')}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                  <span className="text-xl font-bold text-primary">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Name */}
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>

                          {/* Role */}
                          <TableCell className="text-primary font-medium">
                            {member.role}
                          </TableCell>

                          {/* Description */}
                          <TableCell className="max-w-md">
                            <div className="line-clamp-2">{member.description}</div>
                          </TableCell>

                          {/* Social Media */}
                          <TableCell>
                              <div className="flex gap-2">
                                {member.socialMedia?.facebook && (
                                  <a
                                    href={member.socialMedia.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-blue-500/10 rounded transition-colors"
                                    title="Facebook"
                                  >
                                    <FaFacebook className="text-blue-600 dark:text-blue-400" size={18} />
                                  </a>
                                )}
                                {member.socialMedia?.twitter && (
                                  <a
                                    href={member.socialMedia.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-sky-500/10 rounded transition-colors"
                                    title="Twitter"
                                  >
                                    <FaTwitter className="text-sky-500 dark:text-sky-400" size={18} />
                                  </a>
                                )}
                                {member.socialMedia?.linkedin && (
                                  <a
                                    href={member.socialMedia.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-blue-700/10 rounded transition-colors"
                                    title="LinkedIn"
                                  >
                                    <FaLinkedin className="text-blue-700 dark:text-blue-500" size={18} />
                                  </a>
                                )}
                                {member.socialMedia?.instagram && (
                                  <a
                                    href={member.socialMedia.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-pink-600/10 rounded transition-colors"
                                    title="Instagram"
                                  >
                                    <FaInstagram className="text-pink-600 dark:text-pink-400" size={18} />
                                  </a>
                                )}
                                {(!member.socialMedia || 
                                  (!member.socialMedia.facebook && 
                                   !member.socialMedia.twitter && 
                                   !member.socialMedia.linkedin && 
                                   !member.socialMedia.instagram)) && (
                                  <span className="text-xs text-muted-foreground">No links</span>
                                )}
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(member)}
                                  className="p-2 text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={18} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteClick(member)}
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
        {!loading && teamMembers.length > 0 && (
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

      {/* Team Modal */}
      <TeamModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingMember={editingMember}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && memberToDelete && (
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
                  <h3 className="text-xl font-bold text-foreground mb-2">Delete Team Member</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Are you sure you want to delete <span className="font-semibold text-foreground">{memberToDelete.name}</span>? 
                    This action cannot be undone.
                  </p>
                  
                  {/* Member Info */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-3">
                      {memberToDelete.photo ? (
                        <img
                          src={getFileUrl(memberToDelete.photo, 'image')}
                          alt={memberToDelete.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {memberToDelete.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{memberToDelete.name}</p>
                        <p className="text-sm text-muted-foreground">{memberToDelete.role}</p>
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

export default TeamPage;
