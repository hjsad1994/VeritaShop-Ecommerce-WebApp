'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface UserMenuProps {
  theme?: 'dark' | 'light';
  textClass?: string;
}

export default function UserMenu({ 
  theme = 'dark', 
  textClass = 'text-white hover:text-gray-300'
}: UserMenuProps) {
  const { user, isLoading, logout } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  // Ensure component is mounted on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // If user exists and component is mounted, show user menu
  // Wait for mount to avoid hydration mismatch between server and client
  if (mounted && user) {
    return (
      <div className="relative" ref={userDropdownRef}>
        <button
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          className={`flex items-center gap-2 p-2 rounded-full transition-all ${textClass} hover:bg-gray-100 dark:hover:bg-gray-800`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* User Dropdown Menu */}
        {isUserDropdownOpen && (
          <div 
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              width: '224px',
              backgroundColor: isLight ? '#ffffff' : '#1f2937',
              border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              zIndex: 99999,
              overflow: 'hidden'
            }}
          >
            {/* User Info Section */}
            <div 
              style={{ 
                padding: '16px',
                borderBottom: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`
              }}
            >
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: isLight ? '#000000' : '#ffffff',
                marginBottom: '4px',
                lineHeight: '1.4'
              }}>
                {user.name || 'User'}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: isLight ? '#6b7280' : '#9ca3af',
                marginBottom: '4px',
                lineHeight: '1.4'
              }}>
                {user.email}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: isLight ? '#6b7280' : '#6b7280',
                lineHeight: '1.4'
              }}>
                {user.role === 'USER' ? 'Customer' : user.role === 'ADMIN' ? 'Admin' : 'Super Admin'}
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '4px 0' }}>
              {/* Profile Link */}
              <Link 
                href="/profile" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsUserDropdownOpen(false);
                  window.location.href = '/profile';
                }}
                style={{
                  display: 'block',
                  position: 'relative',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: isLight ? '#374151' : '#d1d5db',
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  lineHeight: '1.5',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isLight ? '#f9fafb' : '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{
                  position: 'relative',
                  display: 'block',
                  paddingLeft: '28px'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'inline-block',
                    width: '16px',
                    height: '16px'
                  }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  My Account
                </span>
              </Link>

              {/* Orders Link */}
              <Link 
                href="/orders" 
                onClick={(e) => {
                  e.preventDefault();
                  setIsUserDropdownOpen(false);
                  window.location.href = '/orders';
                }}
                style={{
                  display: 'block',
                  position: 'relative',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: isLight ? '#374151' : '#d1d5db',
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  lineHeight: '1.5',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isLight ? '#f9fafb' : '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{
                  position: 'relative',
                  display: 'block',
                  paddingLeft: '28px'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'inline-block',
                    width: '16px',
                    height: '16px'
                  }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                  My Orders
                </span>
              </Link>

              {/* Admin Link - Only show for admin users */}
              {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <>
                  <div style={{ 
                    borderTop: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
                    margin: '4px 0'
                  }}></div>
                  <Link 
                    href="/admin" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsUserDropdownOpen(false);
                      window.location.href = '/admin';
                    }}
                    style={{
                      display: 'block',
                      position: 'relative',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: isLight ? '#374151' : '#d1d5db',
                      textDecoration: 'none',
                      backgroundColor: 'transparent',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      lineHeight: '1.5',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box',
                      transition: 'background-color 0.15s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isLight ? '#f9fafb' : '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{
                      position: 'relative',
                      display: 'block',
                      paddingLeft: '28px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'inline-block',
                        width: '16px',
                        height: '16px'
                      }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      Admin Dashboard
                    </span>
                  </Link>
                </>
              )}

              {/* Logout Separator */}
              <div style={{ 
                borderTop: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
                margin: '4px 0'
              }}></div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  display: 'block',
                  position: 'relative',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: isLight ? '#dc2626' : '#f87171',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  lineHeight: '1.5',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isLight ? '#fef2f2' : '#7f1d1d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{
                  position: 'relative',
                  display: 'block',
                  paddingLeft: '28px'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'inline-block',
                    width: '16px',
                    height: '16px'
                  }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </span>
                  Logout
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show loading state only if we're actually loading and have no user, or not mounted yet
  // This prevents flash when user is already restored and avoids hydration mismatch
  if (!mounted || (isLoading && !user)) {
    // Render a skeleton that matches the user menu button size to prevent layout shift
    return (
      <div className="relative">
        <div className={`flex items-center gap-2 p-2 rounded-full ${textClass} opacity-0 pointer-events-none`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  // If user is not authenticated and component is mounted, show login/register buttons
  if (mounted && !user) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className={`px-4 py-2 rounded-md font-medium transition-all ${isLight ? 'text-black border border-gray-300 hover:bg-gray-100' : 'text-white border border-white/30 hover:bg-white hover:bg-opacity-10'}`}
        >
          Login
        </Link>
        <Link 
          href="/register" 
          className="px-4 py-2 rounded-md font-semibold transition-all bg-white text-black hover:bg-gray-100"
        >
          Register
        </Link>
      </div>
    );
  }
}
