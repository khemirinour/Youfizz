'use client';

import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`relative z-50 w-full ${className || ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Logo height={50} width={180} />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

