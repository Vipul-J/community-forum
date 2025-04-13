'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ForumForm from '@/components/forums/forumform';

export default function CreateForumPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/forums/create');
    }
  }, [status, router]);  

  const handleSubmit = async (formData: any) => {
    if (!session) {
      setError('You must be logged in to create a forum');
      return;
    }
  
    setIsSubmitting(true);
    setError('');
  
    try {
      const response = await fetch('/api/forums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to create forum (${response.status})`);
        } catch (jsonError) {
          throw new Error(`Failed to create forum: ${response.statusText || response.status}`);
        }
      }
  
      const { data: forum } = await response.json(); 
      router.push(`/`); 
    } catch (err) {
      console.error('Error creating forum:', err);
      setError(err instanceof Error ? err.message : 'Failed to create forum');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <ForumForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </Box>
    </Container>
  );
}