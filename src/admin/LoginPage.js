import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Container } from '@mui/material';
import axios from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a0e17' }}>
      <Container maxWidth="xs">
        <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ color: '#00f0ff', fontWeight: 700, textAlign: 'center', mb: 1 }}>Harvester Panel</Typography>
            <Typography sx={{ color: '#888', textAlign: 'center', mb: 3 }}>Penetration Test Dashboard</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleLogin}>
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' } }} required />
              <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3, input: { color: '#fff' }, label: { color: '#888' } }} required />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
                sx={{ bgcolor: '#00f0ff', color: '#000', fontWeight: 700, py: 1.5, '&:hover': { bgcolor: '#00ccdd' } }}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}