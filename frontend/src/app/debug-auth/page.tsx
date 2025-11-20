'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugAuthPage() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-900 mb-2">Auth State</h3>
              <p><span className="font-medium">isLoading:</span> {isLoading ? 'true' : 'false'}</p>
              <p><span className="font-medium">isAuthenticated:</span> {isAuthenticated ? 'true' : 'false'}</p>
              <p><span className="font-medium">isAdmin:</span> {isAdmin() ? 'true' : 'false'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-900 mb-2">User Data</h3>
              <p><span className="font-medium">User:</span> {user ? 'exists' : 'null'}</p>
              {user && (
                <>
                  <p><span className="font-medium">ID:</span> {user.id}</p>
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Role:</span> {user.role}</p>
                  <p><span className="font-medium">Avatar:</span> {user.avatar || 'none'}</p>
                  <p><span className="font-medium">Phone:</span> {user.phone || 'none'}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">LocalStorage Check</h3>
            <button 
              onClick={() => {
                const stored = localStorage.getItem('verita-user');
                alert(`LocalStorage content:\n${stored || 'No data found'}`);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Check LocalStorage
            </button>
            <button 
              onClick={() => {
                console.log('Auth state:', { user, isAuthenticated, isLoading });
                console.log('LocalStorage:', localStorage.getItem('verita-user'));
              }}
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Log to Console
            </button>
          </div>
          
          <div className="flex space-x-4">
            <Link href="/orders" className="text-blue-600 hover:underline">Go to Orders</Link>
            <Link href="/profile" className="text-blue-600 hover:underline">Go to Profile</Link>
            <Link href="/settings" className="text-blue-600 hover:underline">Go to Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
