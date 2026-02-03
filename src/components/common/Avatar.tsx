import React from 'react';
import { cn } from '@/lib/utils';
import { BadgeCheck } from 'lucide-react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-24 h-24',
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  isVerified = false,
  className,
  onClick,
}) => {
  return (
    <div className={cn('relative inline-block', className)}>
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        className={cn(
          sizeClasses[size],
          'rounded-full object-cover ring-2 ring-card transition-transform hover:scale-105',
          onClick && 'cursor-pointer'
        )}
      />
      {isVerified && (
        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-card p-0.5">
          <BadgeCheck className="h-4 w-4 fill-primary text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

export default Avatar;
