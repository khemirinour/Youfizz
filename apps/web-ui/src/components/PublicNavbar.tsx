'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { ShoppingBag, BookOpen, HelpCircle, Menu, X, Home, LogIn, User, UserCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavbarHydration, getUserDisplayInfo, getDashboardPath, isRouteActive } from '@/lib/navbar.utils';

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const hydrated = useNavbarHydration();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { userName, userInitials } = getUserDisplayInfo(user);
  const dashboardPath = getDashboardPath(user);

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
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/blogs', label: 'Blogs', icon: BookOpen },
    { href: '/support', label: 'Support', icon: HelpCircle },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className="relative z-50 w-full border-b border-border bg-background md:bg-background/95 md:backdrop-blur supports-[backdrop-filter]:md:bg-background/60"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Logo height={50} width={180} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
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

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {hydrated ? (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 min-w-[120px]"
                        aria-label={`User menu for ${userName}`}
                      >
                        <div 
                          className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border border-primary/20 flex-shrink-0"
                          aria-hidden="true"
                        >
                          {userInitials}
                        </div>
                        <span className="max-w-[120px] truncate hidden lg:inline">{userName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{userName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <UserCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={dashboardPath} className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" aria-hidden="true" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/signin">
                    <Button variant="default" size="sm" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <div className="h-9 w-20 animate-pulse bg-muted rounded-md" aria-hidden="true" />
            )}
          </div>

          {/* Mobile Menu Button and Auth */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            {/* Auth Section - Mobile (before menu button) */}
            {hydrated ? (
              <>
                {isAuthenticated && user ? (
                  <Link href={dashboardPath}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1.5 h-9 px-2"
                      aria-label={`Go to dashboard for ${userName}`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border border-primary/20 flex-shrink-0"
                        aria-hidden="true"
                      >
                        {userInitials}
                      </div>
                      <span className="hidden sm:inline text-xs max-w-[60px] truncate">
                        {userName.split(' ')[0]}
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signin">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-1.5 h-9 px-2"
                      aria-label="Sign in"
                    >
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline text-xs">Sign In</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <div className="h-9 w-9 animate-pulse bg-muted rounded-md" aria-hidden="true" />
            )}
            
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="sm"
              onClick={handleMobileMenuToggle}
              className="h-9 w-9 p-0"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className={`md:hidden border-t border-border transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? 'max-h-[600px] opacity-100 py-4' 
              : 'max-h-0 opacity-0 overflow-hidden py-0'
          }`}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isRouteActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleMobileLinkClick}
                  className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                >
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2 h-11"
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {/* Auth Section in Mobile Menu */}
            {hydrated && isAuthenticated && user && (
              <>
                <div className="border-t border-border my-2" />
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
                <Link
                  href={dashboardPath}
                  onClick={handleMobileLinkClick}
                  className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-11"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
              </>
            )}
            
            {hydrated && !isAuthenticated && (
              <Link
                href="/signin"
                onClick={handleMobileLinkClick}
                className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md mt-2"
              >
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start gap-2 h-11"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
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
