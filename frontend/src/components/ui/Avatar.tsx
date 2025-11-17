'use client';

import React from 'react';

interface AvatarProps {
  user?: {
    name?: string;
    avatar?: string;
  } | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '' 
}) => {
  const getInitials = (name?: string): string => {
    if (!name) return '';
    
    const words = name.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    // Get first and last initials (e.g., "Nguyễn Văn A" → "NA")
    const firstInitial = words[0].charAt(0).toUpperCase();
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'md':
        return 'w-10 h-10 text-sm';
      case 'lg':
        return 'w-12 h-12 text-base';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  const sizeClasses = getSizeClasses();
  const initials = getInitials(user?.name);
  const hasAvatar = user?.avatar;
  const hasName = user?.name;

  if (hasAvatar) {
    return (
      <div 
        className={`${sizeClasses} rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ${className}`}
      >
        <img 
          src={user.avatar} 
          alt={`${user.name || 'User'} avatar`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="${sizeClasses} rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center flex-shrink-0 ${className}">
                  ${initials}
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  if (hasName && initials) {
    return (
      <div 
        className={`${sizeClasses} rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center flex-shrink-0 ${className}`}
      >
        {initials}
      </div>
    );
  }

  // Default avatar icon when no name or avatar
  return (
    <div 
      className={`${sizeClasses} rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <svg 
        className="w-1/2 h-1/2 text-gray-600" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
          clipRule="evenodd" 
        />
      </svg>
    </div>
  );
};

export default Avatar;
