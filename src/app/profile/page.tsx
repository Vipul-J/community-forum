'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Box, Container, Typography, Paper, CircularProgress, Alert } from '@mui/material';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('auth/login?callbackUrl=/profile');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Box>
              <Typography variant="h4">{session?.user?.name}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {session?.user?.email}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
}