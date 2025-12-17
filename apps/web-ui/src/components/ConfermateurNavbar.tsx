'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, ShoppingCart, UserCircle, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';
import { useState, useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavbarHydration, getUserDisplayInfo, isRouteActive } from '@/lib/navbar.utils';

export default function ConfermateurNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const hydrated = useNavbarHydration();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { userName, userInitials } = getUserDisplayInfo(user);
  const confermateurName = userName || 'Confermateur';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/confermateur', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/confermateur/orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <nav 
      className="relative z-50 w-full border-b border-border bg-background md:bg-background/95 md:backdrop-blur supports-[backdrop-filter]:md:bg-background/60"
      role="navigation"
      aria-label="Confermateur navigation"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col gap-3 py-3 md:hidden">
          {/* Top Row: Brand, Home Link, and Menu Button */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Link href="/confermateur" className="flex items-center gap-2 min-w-0 flex-1" aria-label="Confermateur Dashboard">
                <Logo height={40} width={120} />
                <span className="text-base sm:text-lg font-bold text-gradient truncate">
                  Confermateur Dashboard
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/" aria-label="Go to home">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 h-9 px-2 sm:px-3"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline text-xs">Home</span>
                </Button>
              </Link>
              <Button
                ref={menuButtonRef}
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                className="h-9 w-9 p-0"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="confermateur-mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Bottom Row: Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isRouteActive(pathname, link.href);
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={handleMobileLinkClick}
                  className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                >
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-1.5 h-9 px-2 sm:px-3 flex-shrink-0"
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="text-xs sm:text-sm whitespace-nowrap">{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Dropdown */}
          <div
            id="confermateur-mobile-menu"
            className={`transition-all duration-300 ease-in-out ${
              mobileMenuOpen 
                ? 'max-h-[300px] opacity-100' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div 
                  className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border border-primary/20 flex-shrink-0"
                  aria-hidden="true"
                >
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{confermateurName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="border-t border-border my-1" />
              <Link
                href="/profile"
                onClick={handleMobileLinkClick}
                className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 h-11"
                >
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Profile</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2 h-11 text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden md:flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/confermateur" className="flex items-center gap-3" aria-label="Confermateur Dashboard">
              <Logo height={48} width={150} />
              <span className="text-xl font-bold text-gradient">Confermateur Dashboard</span>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isRouteActive(pathname, link.href);
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Confermateur Info & Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" aria-label="Go to home">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                <span className="hidden lg:inline">Home</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 min-w-[140px]"
                  aria-label={`User menu for ${confermateurName}`}
                >
                  <div 
                    className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border border-primary/20 flex-shrink-0"
                    aria-hidden="true"
                  >
                    {userInitials}
                  </div>
                  <span className="max-w-[100px] truncate hidden lg:inline">{confermateurName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{confermateurName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={handleMobileMenuToggle}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
