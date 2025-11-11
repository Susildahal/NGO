'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Bell,
  Video,
  Heart,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

interface DashboardStats {
  totalNotices: number;
  totalBankAccounts: number;
  totalCarousels: number;
  recentActivity: number;
}

const DashboardPage = () => {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalNotices: 0,
    totalBankAccounts: 0,
    totalCarousels: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch data from different endpoints
      const [noticesRes, bankDetailsRes, carouselsRes] = await Promise.all([
        axiosInstance.get('/notices').catch(() => ({ data: [] })),
        axiosInstance.get('/bankdetails').catch(() => ({ data: [] })),
        axiosInstance.get('/carousels').catch(() => ({ data: [] })),
      ]);

      const noticesData = Array.isArray(noticesRes.data) ? noticesRes.data : noticesRes.data?.data || [];
      const bankData = Array.isArray(bankDetailsRes.data) ? bankDetailsRes.data : bankDetailsRes.data?.data || [];
      const carouselsData = Array.isArray(carouselsRes.data) ? carouselsRes.data : carouselsRes.data?.data || [];

      setStats({
        totalNotices: noticesData.length || 0,
        totalBankAccounts: bankData.length || 0,
        totalCarousels: carouselsData.length || 0,
        recentActivity: noticesData.length + bankData.length + carouselsData.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const statsCards = [
    {
      title: 'Total Notices',
      value: stats.totalNotices,
      icon: Bell,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      change: '+12%',
      isPositive: true,
      link: '/admin/notic',
    },
    {
      title: 'Bank Accounts',
      value: stats.totalBankAccounts,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400',
      change: '+5%',
      isPositive: true,
      link: '/admin/payment',
    },
    {
      title: 'Carousel Items',
      value: stats.totalCarousels,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
      change: '+8%',
      isPositive: true,
      link: '/admin/carousel',
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-600 dark:text-orange-400',
      change: '+18%',
      isPositive: true,
      link: '/admin',
    },
  ];

  const quickLinks = [
    { title: 'Manage Notices', icon: Bell, href: '/admin/notic', color: 'text-blue-600 dark:text-blue-400' },
    { title: 'Bank Details', icon: DollarSign, href: '/admin/payment', color: 'text-green-600 dark:text-green-400' },
    { title: 'Carousel', icon: FileText, href: '/admin/carousel', color: 'text-purple-600 dark:text-purple-400' },
    { title: 'Videos', icon: Video, href: '/admin/video', color: 'text-red-600 dark:text-red-400' },
    { title: 'Events', icon: Calendar, href: '/admin/events', color: 'text-indigo-600 dark:text-indigo-400' },
    { title: 'History', icon: Clock, href: '/admin/history', color: 'text-yellow-600 dark:text-yellow-400' },
  ];

  const recentActivities = [
    {
      action: 'New notice published',
      time: '2 hours ago',
      icon: Bell,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      action: 'Bank details updated',
      time: '5 hours ago',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      action: 'Carousel image added',
      time: '1 day ago',
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      action: 'New video uploaded',
      time: '2 days ago',
      icon: Video,
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary via-primary to-primary rounded-2xl p-8 text-primary-foreground shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back, Admin! 👋</h1>
            <p className="text-primary-foreground/90 text-lg">
              Here's what's happening with Deep Nepal today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={stat.link}>
              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className={`flex items-center text-sm font-semibold ${stat.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change}
                    {stat.isPositive ? (
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {loading ? '...' : stat.value}
                </h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Links & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <Link key={link.title} href={link.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  className="bg-accent/50 hover:bg-accent rounded-lg p-4 flex items-center space-x-3 transition-all duration-300 hover:scale-105 cursor-pointer group"
                >
                  <div className={`${link.color} group-hover:scale-110 transition-transform duration-300`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{link.title}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors duration-200"
              >
                <div className={`${activity.color} mt-1`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Server Status</p>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Active Users</p>
              <p className="text-xs text-muted-foreground">1 online now</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Page Views</p>
              <p className="text-xs text-muted-foreground">Last updated now</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
