'use client'
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/utils/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import {
  Heart,
  User,
  LogOut,
  Settings,
  BookOpenText,
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
  Telescope,
  Video,
  Clock,
  Home,
  
 
  Laptop,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
 
  useEffect(() => {
    setMounted(true);
    // Load saved preferences
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Check if we're on mobile
    const checkMobile = () => {
      const isMobileView = typeof window !== 'undefined' && window.innerWidth < 1024;
      setIsMobile(isMobileView);
      // Only apply collapsed state on desktop
      setSidebarCollapsed(isMobileView ? false : savedCollapsed);
    };

    checkMobile();
    setDarkMode(savedDarkMode);

    // Apply dark mode class to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Handle resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 1024) {
          setSidebarOpen(true);
        } else {
          setSidebarOpen(false);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleThemeChange = () => {
      // Save preferences
      localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
      localStorage.setItem('darkMode', darkMode.toString());
      
      // Apply dark mode
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    };

    handleThemeChange();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches;
      if (localStorage.getItem('theme') === 'system') {
        setDarkMode(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
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
      href: '/admin', 
      label: 'Dashboard', 
      icon: Home,
    },
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
    { href: '/admin/accounts', label: 'Accounts', icon: UserPlus },
    { href: '/admin/events', label: 'Events', icon: Calendar, badge: '3' },
    { href: '/admin/video', label: 'Videos', icon: Video },
    { href: '/admin/pressreleases', label: 'Press Releases', icon: BookOpenText },
    { href: '/admin/history', label: 'History', icon: Clock },
    { href: '/admin/missionandvision', label: 'Mission & Vision', icon: Telescope },
    { href: '/admin/payment', label: 'Payment', icon: Telescope },
    { href: '/admin/carousel', label: 'Carousel', icon: Telescope },
  ];
  

  const settingsItems: NavigationItem[] = [
    { href: '/admin/profile', label: 'Profile', icon: User },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const getFilteredItems = (items: NavigationItem[], query: string): NavigationItem[] => {
    if (!query.trim()) return items;
    
    return items.reduce((filtered: NavigationItem[], item) => {
      const matchesQuery = item.label.toLowerCase().includes(query.toLowerCase());
      const matchingChildren = item.children 
        ? item.children.filter(child => 
            child.label.toLowerCase().includes(query.toLowerCase())
          )
        : [];

      if (matchesQuery || matchingChildren.length > 0) {
        filtered.push({
          ...item,
          children: matchingChildren
        });
      }
      return filtered;
    }, []);
  };

  const [previousItems, setPreviousItems] = useState<NavigationItem[]>(navigationItems);
  const filteredNavigationItems = searchQuery.trim() === '' ? navigationItems : getFilteredItems(navigationItems, searchQuery);

  useEffect(() => {
    if (searchQuery === '') {
      setPreviousItems(navigationItems);
    }
  }, [searchQuery]);

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const paddingLeft = level === 0 ? (sidebarCollapsed ? 'pl-0' : 'pl-2') : 'pl-8';
    
 

    return (
      <motion.li
        key={item.href}
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 },
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.href)}
              className={`group flex items-center w-full rounded-lg transition-all duration-300 hover:scale-[1.01] ${paddingLeft} ${
                sidebarCollapsed ? 'p-3 justify-center' : 'p-2.5'
              } ${
                isActive
                  ? 'text-sidebar-accent-foreground bg-sidebar-primary/20 font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center justify-center rounded-md transition-all duration-200 flex-shrink-0 ${
                isActive ? 'bg-sidebar-primary/40' : 'bg-sidebar-accent/30 group-hover:bg-sidebar-accent/50'
              } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                <Icon className={`h-4 w-4 transition-all duration-200 ${
                  isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                }`} />
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium text-sm ml-2">{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-sidebar-accent-foreground/20 text-sidebar-accent-foreground' 
                        : 'bg-sidebar-primary/20 text-sidebar-primary'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-3 w-3 text-sidebar-foreground/50" />
                  </div>
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={`group flex items-center w-full rounded-lg transition-all duration-300 hover:scale-[1.01] ${paddingLeft} ${
                sidebarCollapsed ? 'px-0.5 py-1 justify-center ' : 'p-2.5'
              } ${
                isActive
                  ? 'text-sidebar-accent-foreground   bg-sidebar-primary/20 font-medium '
                  : 'text-sidebar-foreground/70  hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center justify-center rounded-md transition-all duration-200 flex-shrink-0 ${
                isActive ? 'bg-sidebar-primary/40' : 'bg-sidebar-accent/30 group-hover:bg-sidebar-accent/50'
              } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                <Icon className={`h-4 w-4 transition-all duration-200 ${
                  isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/ group-hover:text-sidebar-foreground'
                }`} />
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 font-medium text-sm ml-2">{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-sidebar-accent-foreground/20 text-sidebar-accent-foreground' 
                        : 'bg-sidebar-primary/20 text-sidebar-primary'
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
          <ul className="mt-1 space-y-1 ml-2 pl-4 border-l border-sidebar-border/50">
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </motion.li>
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
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        ></motion.div>
      )}

      {/* Sidebar */}
      <motion.aside
        data-sidebar
        className="fixed top-0 left-0 z-50 h-full transform bg-background/80 backdrop-blur-xl border-r border-border shadow-lg lg:shadow-none"
        initial={false}
        animate={{
          width: !isMobile && sidebarCollapsed ? 80 : 256,
          x: (!isMobile || sidebarOpen) ? 0 : -256,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40
        }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <motion.div
            className={`flex items-center border-b border-sidebar-border bg-sidebar/50 ${
              sidebarCollapsed ? 'justify-center p-4' : 'justify-between p-4'
            }`}
            animate={{
              opacity: sidebarOpen || !window.innerWidth || window.innerWidth >= 1024 ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                  <Heart className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-sidebar-foreground">Deep Nepal </h1>
                  <p className="text-xs text-sidebar-foreground/70 font-medium">Admin Portal</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
            )}

            {/* Mobile close button */}
            {!sidebarCollapsed && (
              <button
                className="lg:hidden p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>

          {/* Search Bar */}
          {!sidebarCollapsed && (
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchQuery('');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-10 pr-9 py-2.5 bg-accent/50 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 text-sm text-foreground placeholder-muted-foreground"
                />
                {searchQuery && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-accent"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  {filteredNavigationItems.length === 0
                    ? "No matches found"
                    : `Found ${filteredNavigationItems.length} ${
                        filteredNavigationItems.length === 1 ? "item" : "items"
                      }`}
                </p>
              )}
            </div>
          )}

          {/* Sidebar Navigation */}
          <motion.nav
            className="flex-1 px-3 pb-4 overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
            animate={{
              opacity: sidebarOpen || !window.innerWidth || window.innerWidth >= 1024 ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
          >
            <ul className="space-y-1.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={searchQuery ? 'search' : 'all'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredNavigationItems.length > 0 ? (
                    filteredNavigationItems.map((item) => renderNavigationItem(item))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">No matching items found</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          // Force re-render of navigation items
                          setTimeout(() => {
                            const nav = document.querySelector('nav');
                            if (nav) nav.style.opacity = '0.99';
                            setTimeout(() => {
                              if (nav) nav.style.opacity = '1';
                            }, 0);
                          }, 0);
                        }}
                        className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors"
                      >
                        Show all items
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </ul>

            <div className="mt-6 pt-4 border-t border-sidebar-border">
              {!sidebarCollapsed && (
                <h3 className="px-3 mb-2.5 text-xs font-bold text-sidebar-foreground/60 uppercase tracking-wider">
                  Account
                </h3>
              )}
              <ul className="space-y-1.5">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center rounded-lg transition-all duration-300 hover:scale-[1.01] ${
                          sidebarCollapsed ? 'p-3 justify-center' : 'p-2.5'
                        } ${
                          isActive
                            ? 'text-sidebar-accent-foreground bg-sidebar-primary/20 font-medium '
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <div className={`flex items-center justify-center rounded-md transition-all duration-200 flex-shrink-0 ${
                          isActive ? 'bg-sidebar-primary/40' : 'bg-sidebar-accent/30 group-hover:bg-sidebar-accent/50'
                        } ${sidebarCollapsed ? 'p-2' : 'p-2'}`}>
                          <Icon className={`h-4 w-4 transition-all duration-200 ${
                            isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'
                          }`} />
                        </div>
                        {!sidebarCollapsed && <span className="font-medium text-sm ml-2">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={handleLogout}
                    className={`group flex items-center w-full rounded-lg transition-all duration-300 hover:scale-[1.01] ${
                      sidebarCollapsed ? 'p-3 justify-center' : 'p-2.5'
                    } text-destructive hover:bg-destructive/10`}
                    title={sidebarCollapsed ? 'Logout' : undefined}
                  >
                    <div className={`flex items-center justify-center rounded-md transition-all duration-200 group-hover:bg-destructive/20 flex-shrink-0 ${
                      sidebarCollapsed ? 'p-2' : 'p-2'
                    }`}>
                      <LogOut className="h-4 w-4" />
                    </div>
                    {!sidebarCollapsed && <span className="font-medium text-sm ml-2">Logout</span>}
                  </button>
                </li>
              </ul>
            </div>
          </motion.nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        className="min-h-screen relative"
        animate={{
          marginLeft: !isMobile ? (sidebarCollapsed ? 80 : 256) : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40
        }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm transition-all duration-300">
          <motion.div
            className="px-4 sm:px-6 lg:px-8 py-3"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  className="lg:hidden p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </button>

                {/* Desktop sidebar toggle */}
                <button
                  className="hidden lg:flex p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  
                  {
                    sidebarCollapsed ? (
                      <ChevronRight className="h-5 w-5" />
                    ) : (
                      <ChevronLeft className="h-5 w-5" />
                    )
                  }
                  {/* <PanelLeft className="h-4 w-4" /> */}
                </button>

                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    {getCurrentPageTitle()}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage your organization efficiently
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-3">
                {/* Dark mode toggle */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative w-9 h-9">
                      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setDarkMode(false)} className="cursor-pointer">
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDarkMode(true)} className="cursor-pointer">
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      if (typeof window !== 'undefined') {
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        setDarkMode(prefersDark);
                      }
                    }} className="cursor-pointer">
                      <Laptop className="h-4 w-4 mr-2" />
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 hover:scale-105">
                      <Bell className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-white font-medium text-[10px] animate-pulse">
                        3
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">
                        Notifications
                      </p>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      <DropdownMenuItem className="cursor-pointer p-3 focus:bg-accent">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-foreground">New Event</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Community cleanup scheduled for tomorrow</p>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="cursor-pointer p-3 focus:bg-accent">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-foreground">New Volunteer</p>
                          <p className="text-xs text-muted-foreground mt-0.5">John Doe joined the program</p>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuItem className="cursor-pointer p-3 focus:bg-accent">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-foreground">Report Ready</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Monthly analytics report is ready to review</p>
                        </div>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="cursor-pointer text-xs text-primary font-medium justify-center py-2">
                      View All Notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 pl-2 border-l border-border hover:opacity-80 transition-opacity duration-200 cursor-pointer group">
                      <div className="hidden sm:block text-right">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                          {user?.email?.split('@')[0] || 'Admin User'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Admin</p>
                      </div>
                      <div className="relative group">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary to-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-200">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full animate-pulse"></span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">
                        {user?.email?.split('@')[0] || 'Admin User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-primary mt-1 font-medium">
                        Admin Access
                      </p>
                    </div>
                    
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Link href="/admin/profile" className="w-full">
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Link href="/admin/settings" className="w-full">
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        </header>
      

        {/* Page Content */}
        <motion.main
          className="p-4 sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          {children}
        </motion.main>
      </motion.div>
    </div>
  );
}
