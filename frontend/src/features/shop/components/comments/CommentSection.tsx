import React, { useState, useEffect, useCallback } from 'react';
import { Comment, PaginationMeta } from '@/lib/api/types';
import { commentService } from '@/lib/api/commentService';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { useAuth } from '@/contexts/AuthContext';
import Toast from '@/components/ui/Toast';

interface CommentSectionProps {
  productId: string;
}

export default function CommentSection({ productId }: CommentSectionProps) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchComments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await commentService.getComments({
        productId,
        page,
        limit: 10, // Load 10 root comments per page
        sortBy: 'newest'
      });
      
      if (page === 1) {
        setComments(response.comments);
      } else {
        setComments(prev => [...prev, ...response.comments]);
      }
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCreateComment = async (content: string) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectPath', window.location.pathname);
      window.location.href = '/login';
      return;
    }

    try {
      setSubmitting(true);
      await commentService.createComment({
        productId,
        content
      });
      
      setToastMessage('Comment posted successfully!');
      setShowToast(true);
      
      // Refresh comments to show new one (or append manually if we want to be optimistic/faster)
      // Refreshing is safer to get proper server-generated ID and timestamp
      await fetchComments(1);
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      await commentService.createComment({
        productId,
        content,
        parentId
      });
      
      setToastMessage('Reply posted successfully!');
      setShowToast(true);
      
      // For replies, we definitely want to refresh to show them nested correctly
      await fetchComments(1);
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setToastMessage('Comment deleted successfully.');
      setShowToast(true);
      await fetchComments(1);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 mt-16 py-12">
      <Toast 
        message={toastMessage}
        type="success" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
      
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-black">
          Comments ({pagination?.total || 0})
        </h2>

        <div className="mb-10">
          <CommentForm 
            onSubmit={handleCreateComment}
            isSubmitting={submitting}
            placeholder={isAuthenticated ? "Ask a question or share your thoughts..." : "Please log in to leave a comment"}
            buttonText="Post Comment"
          />
          {!isAuthenticated && (
            <div className="mt-2 text-sm text-gray-500">
              <a href="/login" className="underline hover:text-black">Log in</a> to post a comment.
            </div>
          )}
        </div>

        <div className="space-y-1">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {loading && (
          <div className="py-8 flex justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}

        {!loading && pagination && pagination.page < pagination.totalPages && (
          <div className="mt-8 text-center">
            <button
              onClick={() => fetchComments(pagination.page + 1)}
              className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-all"
            >
              Load More Comments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
