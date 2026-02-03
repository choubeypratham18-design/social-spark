import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bell, 
  MessageCircle, 
  Search, 
  Menu, 
  X,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { useSocial } from '@/context/SocialContext';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const location = useLocation();
  const { currentUser, unreadNotificationsCount, unreadMessagesCount } = useSocial();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/notifications', icon: Bell, label: 'Notifications', badge: unreadNotificationsCount },
    { path: '/messages', icon: MessageCircle, label: 'Messages', badge: unreadMessagesCount },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <span className="text-xl font-bold text-primary-foreground">S</span>
          </div>
          <span className="hidden text-xl font-bold text-foreground sm:block">
            Social<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden lg:inline">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          ))}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <Avatar
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  size="sm"
                  isVerified={currentUser.isVerified}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <Link to={`/profile/${currentUser.username}`}>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-foreground hover:bg-secondary md:hidden"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 border-b border-border bg-card p-4 shadow-lg md:hidden animate-slide-up">
          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Mobile Nav Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              to={`/profile/${currentUser.username}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
