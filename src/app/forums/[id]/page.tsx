"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';
import ForumDetail from '@/components/forums/forumdetail';
import { Forum, Comment } from '@/app/types';
import { useSession } from 'next-auth/react';

export default function ForumPage() {
  const params = useParams();
  const forumId = params?.id as string | undefined;
  const router = useRouter();
  const { data: session } = useSession();
  const [forum, setForum] = useState<Forum | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForumData = async () => {
      setLoading(true);
      try {
        const forumRes = await fetch(`/api/forums/${forumId}`);
        if (!forumRes.ok) {
          throw new Error('Failed to fetch forum');
        }
        const forumData = await forumRes.json();
        setForum(forumData);
        
        const commentsRes = await fetch(`/api/comments?forumId=${forumId}`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
        
        if (session?.user?.id) {
          const likeRes = await fetch(`/api/forums/${forumId}/like?userId=${session.user.id}`);
          if (likeRes.ok) {
            const likeData = await likeRes.json();
            setIsLiked(likeData.isLiked);
          }
        }
      } catch (err) {
        console.error('Error fetching forum data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (forumId) {
      fetchForumData();
    }
  }, [forumId, session]);

  const handleAddComment = async (content: string) => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forumId,
          content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const commentsRes = await fetch(`/api/comments?forumId=${forumId}`);
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleLikeForum = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/forums/${forumId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like');
      }
      
      setIsLiked(prev => !prev);
      
      if (forum) {
        setForum({
          ...forum,
          _count: {
            ...forum._count,
            likes: isLiked 
              ? (forum._count?.likes || 1) - 1 
              : (forum._count?.likes || 0) + 1
          }
        });
      }
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  const handleDeleteForum = async () => {
    if (!session || !forum || session.user?.id !== forum.authorId) return;
    
    try {
      const response = await fetch(`/api/forums/${forumId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete forum');
      }
      
      router.push('/forums');
    } catch (err) {
      console.error('Error deleting forum:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !forum) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Forum not found'}
      </Alert>
    );
  }

  return (
    <ForumDetail
      forum={forum}
      comments={comments}
      onAddComment={handleAddComment}
      onDeleteComment={handleDeleteComment}
      onLikeForum={handleLikeForum}
      onDeleteForum={handleDeleteForum}
      isLiked={isLiked}
    />
  );
}