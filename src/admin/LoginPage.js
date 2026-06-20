import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Container, InputAdornment, IconButton } from '@mui/material';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#0a0e17',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background grid */}
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'gridShift 8s linear infinite',
        '@keyframes gridShift': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(60px, 60px)' }
        }
      }} />

      {/* Glowing orbs */}
      <Box sx={{
        position: 'absolute',
        top: '15%', left: '10%',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'orbFloat 6s ease-in-out infinite',
        '@keyframes orbFloat': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(30px, -30px)' }
        }
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '20%', right: '15%',
        width: 250, height: 250,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,0,85,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'orbFloat2 8s ease-in-out infinite',
        '@keyframes orbFloat2': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-20px, 20px)' }
        }
      }} />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{
          bgcolor: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 3,
          overflow: 'visible',
          position: 'relative'
        }}>
          {/* Top accent line */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent, #00f0ff, #ff0055, transparent)',
            backgroundSize: '200% auto',
            animation: 'shimmer 3s linear infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% center' },
              '100%': { backgroundPosition: '200% center' }
            }
          }} />

          <CardContent sx={{ p: 4 }}>
            {/* Logo area */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{
                width: 64, height: 64, mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(255,0,85,0.1))',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute', inset: -3,
                  borderRadius: '50%',
                  border: '2px solid rgba(0,240,255,0.2)',
                  animation: 'pulseRing 2s ease-in-out infinite'
                },
                '@keyframes pulseRing': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.2 }
                }
              }}>
                <SecurityIcon sx={{ fontSize: 32, color: '#00f0ff' }} />
              </Box>
              <Typography variant="h4" sx={{
                background: 'linear-gradient(135deg, #00f0ff, #0088ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: '1.6rem',
                letterSpacing: '-0.02em',
                mb: 0.5
              }}>
                Harvester Panel
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', letterSpacing: '0.02em' }}>
                Penetration Test Dashboard
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  bgcolor: 'rgba(255,0,85,0.1)',
                  color: '#ff0055',
                  border: '1px solid rgba(255,0,85,0.2)',
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: '#ff0055' }
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderRadius: 2,
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(0,240,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#00f0ff' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.35)', '&.Mui-focused': { color: '#00f0ff' } },
                  '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.25)' }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 20 }} /></InputAdornment>
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderRadius: 2,
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(0,240,255,0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#00f0ff' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.35)', '&.Mui-focused': { color: '#00f0ff' } },
                  '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.25)' }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                        {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #00f0ff, #0088ff)',
                  color: '#000',
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  textTransform: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,240,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 30px rgba(0,240,255,0.3)',
                    background: 'linear-gradient(135deg, #00f0ff, #0077dd)'
                  },
                  '&:active': {
                    transform: 'translateY(1px)'
                  },
                  '&.Mui-disabled': {
                    background: 'linear-gradient(135deg, rgba(0,240,255,0.3), rgba(0,136,255,0.3))'
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)',
                      borderTopColor: '#000', borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                      '@keyframes spin': { 'to': { transform: 'rotate(360deg)' } }
                    }} />
                    Authenticating...
                  </Box>
                ) : 'Sign In'}
              </Button>
            </form>

            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                AUTHORIZED ACCESS ONLY
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}