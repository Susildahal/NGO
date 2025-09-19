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
  HelpCircle,
  Menu,
  X,
  UserPlus,
  Bell,
  ChevronDown,
  ChevronRight,
  Search,
  Moon,
  Sun,
  Minimize2,
  Maximize2,
  Shield,
  Database,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  children?: NavigationItem[];
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
    // Save preferences
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
    localStorage.setItem('darkMode', darkMode.toString());
  }, [sidebarCollapsed, darkMode]);

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
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { 
      href: '/dashboard/analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      children: [
        { href: '/dashboard/analytics/reports', label: 'Reports', icon: FileText },
        { href: '/dashboard/analytics/metrics', label: 'Metrics', icon: BarChart3 },
      ]
    },
    { 
      href: '/dashboard/volunteers', 
      label: 'Volunteers', 
      icon: Users, 
      badge: '24',
      children: [
        { href: '/dashboard/volunteers/active', label: 'Active', icon: Users },
        { href: '/dashboard/volunteers/pending', label: 'Pending', icon: UserPlus },
      ]
    },
    { href: '/dashboard/accounts', label: 'Account Management', icon: UserPlus },
    { href: '/dashboard/reports', label: 'Reports', icon: FileText },
    { href: '/dashboard/events', label: 'Events', icon: Calendar, badge: '3' },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: '12' },
    { href: '/dashboard/database', label: 'Database', icon: Database },
  ];

  const settingsItems: NavigationItem[] = [
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/dashboard/security', label: 'Security', icon: Shield },
    { href: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
  ];

  const filteredNavigationItems = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const paddingLeft = level === 0 ? 'pl-3' : 'pl-8';

    return (
      <li key={item.href}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.href)}
              className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${paddingLeft} ${
                isActive
                  ? `text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg ${!sidebarCollapsed ? 'font-medium' : ''}`
                  : `text-gray-600 hover:bg-gray-100 hover:text-gray-800 ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : ''}`
              }`}
            >
              <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'text-gray-500'} transition-colors`} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                      isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${paddingLeft} ${
                isActive
                  ? `text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg ${!sidebarCollapsed ? 'font-medium' : ''}`
                  : `text-gray-600 hover:bg-gray-100 hover:text-gray-800 ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : ''}`
              }`}
            >
              <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'text-gray-500'} transition-colors`} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-blue-100 text-blue-800'
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
          <ul className="mt-1 space-y-1">
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';
  const mainMargin = sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 ${sidebarWidth} h-full transition-all duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center p-4' : 'justify-between p-4'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>NGO Portal</h1>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Dashboard</p>
                </div>
              </div>
            )}
            
            {sidebarCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
            )}

            {/* Desktop collapse button */}
            <div className="hidden lg:flex items-center space-x-2">
              {!sidebarCollapsed && (
                <button
                  className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'text-gray-400 hover:text-gray-200' : ''} transition-colors`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              )}
              
              <button
                className={`text-gray-500 hover:text-gray-700 ${darkMode ? 'text-gray-400 hover:text-gray-200' : ''} transition-colors`}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
            </div>

            {/* Mobile close button */}
            <button
              className={`lg:hidden text-gray-500 hover:text-gray-700 ${darkMode ? 'text-gray-400 hover:text-gray-200' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          {!sidebarCollapsed && (
            <div className="p-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              {filteredNavigationItems.map((item) => renderNavigationItem(item))}
            </ul>

            <div className={`mt-8 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {!sidebarCollapsed && (
                <h3 className={`px-3 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-2`}>
                  Settings
                </h3>
              )}
              <ul className="space-y-1">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? `text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg ${!sidebarCollapsed ? 'font-medium' : ''}`
                            : `text-gray-600 hover:bg-gray-100 hover:text-gray-800 ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : ''}`
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'text-gray-500'} transition-colors`} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={sidebarCollapsed ? 'Logout' : undefined}
                  >
                    <LogOut className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                    {!sidebarCollapsed && <span>Logout</span>}
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} min-h-screen`}>
        {/* Header */}
        <header className={`shadow-sm border-b sticky top-0 z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className={`lg:hidden mr-2 p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {navigationItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle (mobile) */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <button className={`relative p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center">
                <div className="hidden md:flex items-center mr-4">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {user?.email?.split('@')[0] || 'Admin User'}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Administrator</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
}