import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function CommentForm({
  onSubmit,
  isSubmitting,
  placeholder = 'Write a comment...',
  buttonText = 'Post Comment',
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    if (!isAuthenticated) {
        // Redirect to login logic handled by parent or global interceptor usually, 
        // but here we expect the parent to check auth before showing form or handle the submit.
        // However, for better UX, the form might be visible but submit triggers auth check.
        // We will assume the parent handles the actual API call which checks auth.
    }

    await onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none transition-all text-sm text-black"
        />
        <div className="mt-2 flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Posting...' : buttonText}
          </button>
        </div>
      </div>
    </form>
  );
}
