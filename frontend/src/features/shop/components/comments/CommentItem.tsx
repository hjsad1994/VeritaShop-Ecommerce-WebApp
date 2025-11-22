import React, { useState } from 'react';
import Image from 'next/image';
import { Comment } from '@/lib/api/types';
import CommentForm from './CommentForm';
import { useAuth } from '@/contexts/AuthContext';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onUpdate?: (commentId: string, content: string) => Promise<void>;
  level?: number;
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  onUpdate,
  level = 0
}: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?.id === comment.userId;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleReply = async (content: string) => {
    try {
      setIsSubmitting(true);
      await onReply(comment.id, content);
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex gap-4 ${level > 0 ? 'ml-12 mt-4' : 'py-6 border-b border-gray-100'}`}>
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
          {comment.user.avatar ? (
            <Image
              src={comment.user.avatar}
              alt={comment.user.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black text-white font-bold">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-black">{comment.user.name}</span>
          {comment.user.role === 'ADMIN' && (
            <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
              Admin
            </span>
          )}
          <span className="text-xs text-gray-500">• {formatDate(comment.createdAt)}</span>
        </div>

        <div className="text-sm text-gray-700 leading-relaxed mb-2">
            {comment.content}
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <button 
            onClick={() => {
                if (!isAuthenticated) {
                    window.location.href = '/login';
                    sessionStorage.setItem('redirectPath', window.location.pathname);
                    return;
                }
                setIsReplying(!isReplying)
            }}
            className="hover:text-black transition-colors flex items-center gap-1"
          >
            Reply
          </button>
          
          {canDelete && onDelete && (
             <button 
               onClick={() => {
                 if (confirm('Are you sure you want to delete this comment?')) {
                   onDelete(comment.id);
                 }
               }}
               className="hover:text-red-600 transition-colors"
             >
               Delete
             </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-4">
            <CommentForm
              onSubmit={handleReply}
              isSubmitting={isSubmitting}
              placeholder={`Reply to ${comment.user.name}...`}
              buttonText="Post Reply"
              onCancel={() => setIsReplying(false)}
              autoFocus
            />
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                onUpdate={onUpdate}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
