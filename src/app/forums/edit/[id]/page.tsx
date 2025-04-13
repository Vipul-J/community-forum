'use client';

import { useState, useEffect, use } from 'react';
import { Container, Box, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ForumForm from '@/components/forums/forumform';
import { Forum } from '@/app/types';

interface EditForumPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function EditForumPage({ params }: EditForumPageProps) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const id = resolvedParams.id;
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const [forum, setForum] = useState<Forum | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/login?callbackUrl=/forums/edit/${id}`);
      return;
    }

    const fetchForum = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/forums/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Forum not found');
          }
          throw new Error('Failed to fetch forum');
        }
        
        const data = await response.json();
        console.log('Forum data received:', data);
        
        const formattedForum: Forum = {
          id: data.id,
          title: data.title || '',
          description: data.description || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          authorId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        
        setForum(formattedForum);
        
      } catch (err) {
        console.error('Error fetching forum:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchForum();
    }
  }, [id, session, status, router]);

  const handleSubmit = async (formData: any) => {
    if (!session) {
      setError('You must be logged in to edit a forum');
      return;
    }

    if (!forum) {
      setError('Forum data not found');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/forums/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update forum');
      }

      router.push(`/forums/${id}`);
    } catch (err) {
      console.error('Error updating forum:', err);
      setError(err instanceof Error ? err.message : 'Failed to update forum');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!forum) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ my: 4 }}>
          Forum not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <ForumForm
          initialData={forum}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      </Box>
    </Container>
  );
}