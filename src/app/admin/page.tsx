import React from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
  Bell,
  Video,
  Image,
  Briefcase,
  BookOpen,
  Settings,
  Award,
  Heart,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const DashboardPage = () => {
  const managementSections = [
    {
      title: 'Content Management',
      description: 'Manage all your website content in one place',
      icon: FileText,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      links: [
        { name: 'Notices', href: '/admin/notic', icon: Bell },
        { name: 'Blog Posts', href: '/admin/blog', icon: BookOpen },
        { name: 'Press Releases', href: '/admin/pressreleases', icon: FileText },
        { name: 'History', href: '/admin/history', icon: Calendar },
      ],
    },
    {
      title: 'Media Gallery',
      description: 'Organize and showcase your visual content',
      icon: Image,
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      links: [
        { name: 'Carousel', href: '/admin/carousel', icon: Image },
        { name: 'Gallery', href: '/admin/gallery', icon: Image },
        { name: 'Videos', href: '/admin/video', icon: Video },
      ],
    },
    {
      title: 'Organization',
      description: 'Manage team and organization details',
      icon: Users,
      gradient: 'from-green-500 via-green-600 to-emerald-600',
      links: [
        { name: 'Team Members', href: '/admin/team', icon: Users },
        { name: 'Mission & Vision', href: '/admin/missionandvision', icon: Award },
        { name: 'Success Stories', href: '/admin/successstory', icon: Heart },
      ],
    },
    {
      title: 'Financial',
      description: 'Handle payment and account information',
      icon: DollarSign,
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      links: [
        { name: 'Bank Accounts', href: '/admin/payment', icon: DollarSign },
        { name: 'Account Settings', href: '/admin/accounts', icon: Briefcase },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl p-12 overflow-hidden shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <p className="text-white/90 text-sm font-medium">Admin Portal</p>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Deep Nepal
          </h1>
          <p className="text-white/90 text-xl mb-8 max-w-2xl">
            Manage your organization&apos;s content, team, and settings all in one place. 
            Choose a section below to get started.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/admin/settings">
              <button className="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </Link>
            <Link href="/admin/profile">
              <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center gap-2">
                <Users className="w-5 h-5" />
                View Profile
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Management Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {managementSections.map((section, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Section Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${section.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <section.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">{section.title}</h2>
                <p className="text-muted-foreground text-sm">{section.description}</p>
              </div>
            </div>

            {/* Links Grid */}
            <div className="space-y-2">
              {section.links.map((link, linkIndex) => (
                <Link key={linkIndex} href={link.href}>
                  <div className="flex items-center justify-between p-4 bg-accent/30 hover:bg-accent rounded-xl transition-all duration-300 group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                        <link.icon className="w-5 h-5 text-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{link.name}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover/item:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Need Help?</h3>
              <p className="text-white/80">Check our documentation or contact support</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl">
              Documentation
            </button>
            <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Additional Settings Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/settings">
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">System Settings</h3>
                <p className="text-sm text-muted-foreground">Configure your admin preferences</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>

        <Link href="/admin/profile">
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Your Profile</h3>
                <p className="text-sm text-muted-foreground">View and edit your account details</p>
              </div>
              <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
