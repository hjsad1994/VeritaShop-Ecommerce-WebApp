'use client';

import React from 'react';
import type { User } from '@/lib/api';

interface AdminHeaderProps {
  user: User;
  onLogout?: () => void;
}

export default function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  const initials = user.name?.charAt(0) ?? user.email.charAt(0) ?? 'A';

  return (
    <header className="bg-white border-b border-gray-300 shadow-sm flex-shrink-0" suppressHydrationWarning>
      <div className="px-8 py-4 flex items-center justify-between" suppressHydrationWarning>
        <div className="flex items-center gap-4" suppressHydrationWarning>
          <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-6" suppressHydrationWarning>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user.name ?? 'Administrator'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold shadow-sm uppercase">
              {initials}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
