'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/lib/api/types';
import { authService } from '@/lib/api/authService';
import toast from 'react-hot-toast';

export default function AccountsPage() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock users data since backend doesn't have getAllUsers API
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@veritashop.com',
      name: 'Admin User',
      role: 'ADMIN',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2', 
      email: 'user1@example.com',
      name: 'John Doe',
      role: 'USER',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20')
    },
    {
      id: '3',
      email: 'user2@example.com', 
      name: 'Jane Smith',
      role: 'USER',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10')
    }
  ]);

  useEffect(() => {
    // In a real implementation, you might have a local cache or different approach
    // since backend doesn't provide getAllUsers API for admin
  }, []);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setModalMode('add');
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      // Since backend doesn't have delete API, we'll just remove from local state
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted from local list');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const userData = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        avatar: formData.get('avatar') as string,
      };

      if (modalMode === 'add') {
        // Use existing auth register API
        const createData = {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          name: userData.name,
        };
        
        const response = await authService.register(createData);
        if (response.success) {
          const newUser = {
            ...response.data.user,
            phone: userData.phone,
            address: userData.address,
            avatar: userData.avatar,
          };
          setUsers([...users, newUser]);
          toast.success('User created successfully');
          setShowModal(false);
        }
      } else if (selectedUser) {
        // For edit, we would need the user's auth token
        // This is a limitation since we can't update other users with current APIs
        toast.error('User update limited - profile updates only work for current user');
        setShowModal(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save user';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filteredUsers computed property
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-black mb-2">User Management</h2>
          <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Join Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Updated</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-black">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'ADMIN' || user.role === 'MANAGER'
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {user.role === 'MANAGER' ? 'Manager' : user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No accounts found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">
                {modalMode === 'add' ? 'Add New User' : 'Edit User'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedUser?.name || ''}
                  required
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedUser?.email}
                  required
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              {modalMode === 'add' && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Enter password (min 6 characters)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={selectedUser?.phone || ''}
                  placeholder="+84 123 456 789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Address (Optional)</label>
                <textarea
                  name="address"
                  defaultValue={''}
                  rows={3}
                  placeholder="Enter user address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Avatar URL (Optional)</label>
                <input
                  type="url"
                  name="avatar"
                  defaultValue={selectedUser?.avatar || ''}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
