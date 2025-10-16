'use client'
import React, { useEffect, useState } from 'react';
import { auth } from '@/utils/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import {
  Heart,
  User,
  LogOut,
  Settings,
  Home,
  BarChart3,
  Users,
  FileText,
  Calendar,
  Menu,
  X,
  UserPlus,
  Bell,
  ChevronDown,
  Search,
  Moon,
  Sun,
  PanelLeft,
  Telescope,

  Database,
  MessageSquare,
  Clock,
 
} from 'lucide-react';
import Link from 'next/link';

interface adminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  children?: NavigationItem[];
}

export default function adminLayout({ children }: adminLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Load saved preferences
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setSidebarCollapsed(savedCollapsed);
    setDarkMode(savedDarkMode);

    // Apply dark mode class to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, mounted]);

  useEffect(() => {
    // Close mobile sidebar when route changes
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mounted) return;
    // Save preferences and apply dark mode
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
    localStorage.setItem('darkMode', darkMode.toString());
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [sidebarCollapsed, darkMode, mounted]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const navigationItems: NavigationItem[] = [
   
    { 
      href: '/admin/stats', 
      label: 'Stats & Analytics', 
      icon: BarChart3,
      children: [
        { href: '/admin/stats/reports', label: 'Reports', icon: FileText },
        { href: '/admin/stats/metrics', label: 'Metrics', icon: BarChart3 },
      ]
    },
    { 
      href: '/admin/volunteers', 
      label: 'Volunteers', 
      icon: Users, 
      badge: '24',
      children: [
        { href: '/admin/volunteers/active', label: 'Active', icon: Users },
        { href: '/admin/volunteers/pending', label: 'Pending', icon: UserPlus },
      ]
    },
    { href: '/admin/accounts', label: 'Account Management', icon: UserPlus },
    { href: '/admin/stats', label: 'Stats and Analytics ', icon: BarChart3 },
    { href: '/admin/events', label: 'Events', icon: Calendar, badge: '3' },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare, badge: '12' },
    { href: '/admin/history', label: 'History', icon: Clock },
    { href: '/admin/missionandvision', label: 'Mission & Vision', icon: Telescope },
  ];

  const settingsItems: NavigationItem[] = [
    { href: '/admin/profile', label: 'Profile', icon: User },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const filteredNavigationItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const paddingLeft = level === 0 ? (sidebarCollapsed ? 'pl-0' : 'pl-3') : 'pl-8';

    return (
      <li key={item.href}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.href)}
              className={`group flex items-center w-full rounded-xl transition-all duration-300 hover:scale-[1.02] ${paddingLeft} ${
                sidebarCollapsed ? 'p-2.5 justify-center' : 'p-3'
              } ${
                isActive
                  ? sidebarCollapsed 
                    ? 'text-white bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-xl shadow-blue-500/30 font-medium border-2 border-blue-400/30'
                    : 'text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg shadow-blue-500/25 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
                isActive ? (sidebarCollapsed ? 'bg-white/25 shadow-sm' : 'bg-white/10') : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
              } ${sidebarCollapsed ? 'p-1.5' : 'p-1.5 mr-3'}`}>
                <Icon className={`h-4 w-4 transition-all duration-200 ${
                  isActive ? 'text-white drop-shadow-sm' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'
                }`} />
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium text-xs">{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mr-2 transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 text-white backdrop-blur-sm' 
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={`group flex items-center w-full rounded-xl transition-all duration-300 hover:scale-[1.02] ${paddingLeft} ${
                sidebarCollapsed ? 'p-2.5 justify-center' : 'p-3'
              } ${
                isActive
                  ? sidebarCollapsed 
                    ? 'text-white bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-xl shadow-blue-500/30 font-medium border-2 border-blue-400/30'
                    : 'text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg shadow-blue-500/25 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
                isActive ? (sidebarCollapsed ? 'bg-white/25 shadow-sm' : 'bg-white/10') : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
              } ${sidebarCollapsed ? 'p-1.5' : 'p-1.5 mr-3'}`}>
                <Icon className={`h-4 w-4 transition-all duration-200 ${
                  isActive ? 'text-white drop-shadow-sm' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'
                }`} />
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 font-medium text-xs">{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 text-white backdrop-blur-sm' 
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )}
        </div>
        
        {/* Submenu items */}
        {hasChildren && isExpanded && !sidebarCollapsed && (
          <ul className="mt-2 space-y-1 ml-2 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        </div>
      </div>
    );
  }

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.href === pathname) ||
                       settingsItems.find(item => item.href === pathname);
    return currentItem?.label || 'admin';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full transition-all duration-300 transform ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex items-center border-b border-gray-200/50 dark:border-gray-700/50 ${
            sidebarCollapsed ? 'justify-center p-4' : 'justify-between p-4'
          }`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 dark:text-white">NGO Portal</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Admin Dashboard</p>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Heart className="h-5 w-5 text-white" />
              </div>
            )}

            {/* Mobile close button */}
            {!sidebarCollapsed && (
              <button
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Bar */}
          {!sidebarCollapsed && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-4 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <ul className="space-y-2">
              {filteredNavigationItems.map((item) => renderNavigationItem(item))}
            </ul>

            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              {!sidebarCollapsed && (
                <h3 className="px-3 mb-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Account
                </h3>
              )}
              <ul className="space-y-2">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                          sidebarCollapsed ? 'p-2.5 justify-center' : 'p-3'
                        } ${
                          isActive
                            ? sidebarCollapsed 
                              ? 'text-white bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-xl shadow-blue-500/30 font-medium border-2 border-blue-400/30'
                              : 'text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg shadow-blue-500/25 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-white'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <div className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
                          isActive ? (sidebarCollapsed ? 'bg-white/25 shadow-sm' : 'bg-white/10') : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
                        } ${sidebarCollapsed ? 'p-1.5' : 'p-1.5 mr-3'}`}>
                          <Icon className={`h-4 w-4 transition-all duration-200 ${
                            isActive ? 'text-white drop-shadow-sm' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'
                          }`} />
                        </div>
                        {!sidebarCollapsed && <span className="font-medium text-xs">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={handleLogout}
                    className={`group flex items-center w-full rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                      sidebarCollapsed ? 'p-2.5 justify-center' : 'p-3'
                    } text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20`}
                    title={sidebarCollapsed ? 'Logout' : undefined}
                  >
                    <div className={`flex items-center justify-center rounded-lg transition-all duration-200 group-hover:bg-red-100 dark:group-hover:bg-red-800/30 ${
                      sidebarCollapsed ? 'p-1.5' : 'p-1.5 mr-3'
                    }`}>
                      <LogOut className="h-4 w-4" />
                    </div>
                    {!sidebarCollapsed && <span className="font-medium text-xs">Logout</span>}
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 min-h-screen ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </button>

                {/* Desktop sidebar toggle */}
                <button
                  className="hidden lg:flex p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <PanelLeft className="h-4 w-4" />
                </button>

                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    {getCurrentPageTitle()}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage your organization efficiently
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-2">
                {/* Dark mode toggle */}
                <button
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium text-[10px]">
                    3
                  </span>
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {user?.email?.split('@')[0] || 'Admin User'}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Admin</p>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}