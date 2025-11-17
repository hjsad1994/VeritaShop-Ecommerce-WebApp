'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authService } from '@/lib/api';

type ApiError = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    if (apiError.errors && apiError.errors.length > 0) {
      const messages = apiError.errors
        .map(err => err?.message)
        .filter((msg): msg is string => Boolean(msg));
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }
    if (apiError.message) {
      return apiError.message;
    }
  }
  return 'Failed to sign in. Please try again.';
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      const user = response.data?.user;

      if (!user || user.role !== 'ADMIN') {
        toast.error('You do not have admin permissions.');
        await authService.logout();
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.name ?? 'Admin'}!`);
      router.replace('/admin');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-black">
            VeritaShop Admin
          </Link>
          <p className="text-gray-500 mt-2">Sign in to manage the store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition text-black placeholder:text-gray-500 bg-white"
              placeholder="admin@veritashop.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition text-black placeholder:text-gray-500 bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Need help?{' '}
          <a href="mailto:support@veritashop.com" className="text-black font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

