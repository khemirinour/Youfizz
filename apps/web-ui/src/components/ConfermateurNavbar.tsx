'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/youfizz-logo.png';

export default function ConfermateurNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const confermateurName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'Confermateur';
  const confermateurInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'C'
    : 'C';

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="relative z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col gap-3 py-3 md:hidden">
          {/* Top Row: Brand and Logout */}
          <div className="flex items-center justify-between w-full">
            <Link href="/confermateur" className="flex items-center gap-2">
              <Image src={logo.src || logo} alt="YouFizz" width={40} height={40} className="h-10 w-10" />
              <span className="text-base sm:text-lg font-bold text-gradient">Confermateur Dashboard</span>
            </Link>
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
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
              <Link href="/confermateur">
                <Button
                  variant={isActive('/confermateur') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1.5 h-9 px-2 sm:px-3 flex-shrink-0"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm">Dashboard</span>
                </Button>
              </Link>
              <Link href="/confermateur/orders">
                <Button
                  variant={isActive('/confermateur/orders') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-1.5 h-9 px-2 sm:px-3 flex-shrink-0"
                >
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm">Orders</span>
                </Button>
              </Link>
            </div>
            
            {/* User Info - Condensed */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:block text-xs">
                <span className="text-muted-foreground">Hi,</span>
                <span className="ml-1 font-medium truncate max-w-[80px]">{confermateurName.split(' ')[0]}</span>
              </div>
              <div className="sm:hidden w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border border-primary/20">
                {confermateurInitials}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden md:flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/confermateur" className="flex items-center gap-3">
              <Image src={logo.src || logo} alt="YouFizz" width={48} height={48} className="h-12 w-12" />
              <span className="text-xl font-bold text-gradient">Confermateur Dashboard</span>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <Link href="/confermateur">
              <Button
                variant={isActive('/confermateur') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link href="/confermateur/orders">
              <Button
                variant={isActive('/confermateur/orders') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Orders</span>
              </Button>
            </Link>
          </div>

          {/* Confermateur Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Welcome,</span>
              <span className="ml-2 font-medium">{confermateurName}</span>
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






