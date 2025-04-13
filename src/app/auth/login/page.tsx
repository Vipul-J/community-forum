"use client";

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    TextField,
    Paper,
    Typography,
    Stack,
    Divider,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginPage() {
    const router = useRouter();
    const { status } = useSession();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get('callbackUrl') || '/';
    const error = searchParams?.get('error');
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        if (status === 'authenticated') {
            router.push(callbackUrl);
        }
    }, [status, router, callbackUrl]);

    const handleSignIn = async (provider: string) => {
        setIsRedirecting(true);
        await signIn(provider, { callbackUrl });
    };

    const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        setEmailError('');
        setPasswordError('');
        setLoginError('');

        let isValid = true;

        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        }

        if (!isValid) return;

        setIsRedirecting(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
                callbackUrl
            });

            if (result?.error) {
                setIsRedirecting(false);
                setLoginError(result.error === 'CredentialsSignin'
                    ? 'Invalid email or password'
                    : 'An error occurred during sign in');
            } else if (result?.url) {
                router.push(result.url);
            }
        } catch (error) {
            setIsRedirecting(false);
            setLoginError('An unexpected error occurred');
            console.error('Sign in error:', error);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    if (status === 'authenticated' || isRedirecting) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h5">Redirecting...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Stack spacing={3}>
                    <Box textAlign="center">
                        <Typography variant="h4" component="h1" gutterBottom>
                            Sign In
                        </ Typography>
                        <Typography variant="body1" color="text.secondary">
                            Sign in to participate in discussions
                        </Typography>
                    </Box>

                    {(error || loginError) && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {loginError || (error === 'CredentialsSignin'
                                ? 'Invalid email or password'
                                : 'An error occurred during sign in')}
                        </Alert>
                    )}

                    <form onSubmit={handleEmailPasswordSignIn}>
                        <Stack spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!emailError}
                                helperText={emailError}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!passwordError}
                                helperText={passwordError}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePasswordVisibility}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={isRedirecting}
                            >
                                Sign In
                            </Button>
                        </Stack>
                    </form>

                    <Box sx={{ textAlign: 'right' }}>
                        <Link href="/forgot-password" passHref>
                            <Typography variant="body2" color="primary">
                                Forgot password?
                            </Typography>
                        </Link>
                    </Box>

                    <Divider>
                        <Typography variant="body2" color="text.secondary">
                            OR
                        </Typography>
                    </Divider>

                    <Button
                        variant="outlined"
                        startIcon={<GitHubIcon />}
                        fullWidth
                        onClick={() => handleSignIn('github')}
                        size="large"
                    >
                        Continue with GitHub
                    </Button>

                    <Divider />

                    <Box textAlign="center">
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <Link href="/register" passHref>
                                <Typography variant="body2" color="primary" component="span">
                                    Create an Account
                                </Typography>
                            </Link>
                        </Typography>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}