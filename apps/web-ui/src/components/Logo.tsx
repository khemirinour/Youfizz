'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';
interface LogoProps {
  className?: string;
  height?: number;
  width?: number;
  onClick?: () => void;
  showText?: boolean;
}

export default function Logo({ 
  className, 
  height = 60, 
  width = 200,
  onClick,
  showText = true 
}: LogoProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "cursor-pointer flex items-center gap-3 transition-opacity hover:opacity-80",
        className
      )}
    >
      <Image
        src={logo}
        alt="youfizz Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}

