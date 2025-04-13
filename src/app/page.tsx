'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import ForumList from '@/components/forums/forumlist';
import { Forum } from '@/app/types';

export default function Home() {
  const [filteredForums, setFilteredForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await fetch('/api/forums');
        if (!response.ok) {
          throw new Error('Failed to fetch forums');
        }
        const data = await response.json();
        setFilteredForums(data);
      } catch (err) {
        console.error('Error fetching forums:', err);
        setError('Failed to load forums. Please try again later .');
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, []); 

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Community Forums
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
          Join discussions and share your thoughts
        </Typography> 
        {loading ? (
          <Box display="flex" justifyContent="center" my={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" my={4}>
            {error}
          </Typography>
        ) : (
          <ForumList forums={filteredForums} />
        )}
      </Box>
    </Container>
  );
}