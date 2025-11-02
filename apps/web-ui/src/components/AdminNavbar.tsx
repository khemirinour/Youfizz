'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, Users, BarChart3 } from 'lucide-react';

interface AdminNavbarProps {
  activeTab?: 'users' | 'stats';
  onTabChange?: (tab: 'users' | 'stats') => void;
}

export default function AdminNavbar({ activeTab = 'users', onTabChange }: AdminNavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const adminName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Admin';
  const adminInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'A'
    : 'A';

  return (
    <nav className="relative z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col gap-3 py-3 md:hidden">
          {/* Top Row: Brand and Logout */}
          <div className="flex items-center justify-between w-full">
            <h1 className="text-base sm:text-lg font-bold text-gradient">Admin Dashboard</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1.5 h-9 px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
          
          {/* Bottom Row: Tabs and User Info */}
          <div className="flex items-center justify-between gap-2">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 flex-1">
              <Button
                variant={activeTab === 'users' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange?.('users')}
                className="flex items-center gap-1.5 h-9 px-2 sm:px-3 flex-1 sm:flex-initial"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm">Users</span>
              </Button>
              <Button
                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange?.('stats')}
                className="flex items-center gap-1.5 h-9 px-2 sm:px-3 flex-1 sm:flex-initial"
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm">Stats</span>
              </Button>
            </div>
            
            {/* User Info - Condensed */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-xs">
                <span className="text-muted-foreground">Hi,</span>
                <span className="ml-1 font-medium truncate max-w-[80px]">{adminName.split(' ')[0]}</span>
              </div>
              <div className="sm:hidden w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border border-primary/20">
                {adminInitials}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden md:flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gradient">Admin Dashboard</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange?.('users')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span>Users</span>
            </Button>
            <Button
              variant={activeTab === 'stats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange?.('stats')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Stats</span>
            </Button>
          </div>

          {/* Admin Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Welcome,</span>
              <span className="ml-2 font-medium">{adminName}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

