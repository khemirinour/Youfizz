'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { ShoppingBag, BookOpen, HelpCircle, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    if (path === '/shop') {
      return pathname === '/shop';
    }
    if (path === '/article') {
      return pathname.startsWith('/article/');
    }
    if (path === '/blogs') {
      return pathname === '/blogs';
    }
    if (path === '/support') {
      return pathname === '/support';
    }
    return false;
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/blogs', label: 'Blogs', icon: BookOpen },
    { href: '/support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <nav className="relative z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo height={50} width={180} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive(link.href) ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(link.href) ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

