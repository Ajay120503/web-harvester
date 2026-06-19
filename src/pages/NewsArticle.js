import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Card, CardContent, Chip, Avatar, Divider, IconButton, AppBar, Toolbar, TextField, Paper } from '@mui/material';
import harvester from '../harvester/HarvesterCore';

export default function NewsArticle() {
  const navigate = useNavigate();

  useEffect(() => { harvester.init(); }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Top Bar */}
      <AppBar position="sticky" sx={{ bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', color: '#333' }}>
        <Container maxWidth="md">
          <Toolbar sx={{ px: { xs: 0 } }} disableGutters>
            <Typography sx={{ fontWeight: 800, color: '#1a73e8', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => navigate('/')}>
              NewsHub
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" size="small" onClick={() => navigate('/giveaway')} sx={{ borderColor: '#e74c3c', color: '#e74c3c', fontWeight: 600, borderRadius: 20 }}>
              🎁 Free iPhone
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* Article Header */}
        <Card elevation={0} sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label="EXCLUSIVE" size="small" sx={{ bgcolor: '#e74c3c', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
              <Chip label="DATA BREACH" size="small" sx={{ bgcolor: '#333', color: '#fff', fontWeight: 600, fontSize: '0.7rem' }} />
              <Typography sx={{ color: '#aaa', fontSize: '0.75rem', ml: 'auto' }}>23 minutes ago</Typography>
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111', mb: 2, lineHeight: 1.3, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Massive Data Leak Exposes Millions of Passwords — Is Yours on the List?
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: '#1a73e8', color: '#fff', fontWeight: 700 }}>NI</Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>NewsHub Investigates</Typography>
                <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Security Desk • 847K reads</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Article Image Placeholder */}
            <Box
              sx={{
                height: 240,
                bgcolor: '#e8eaf6',
                borderRadius: 2,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Typography sx={{ fontSize: '5rem', opacity: 0.4 }}>🔓</Typography>
              <Chip label="Photo: Security researchers analyzing data" size="small" sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem' }} />
            </Box>

            <Typography sx={{ color: '#555', lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
              A massive security breach has compromised the personal data of over 87 million users worldwide, according to cybersecurity researchers who discovered the incident earlier this week. The breach exposed email addresses, encrypted passwords, phone numbers, and in some cases, full credit card details.
            </Typography>
            <Typography sx={{ color: '#555', lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
              "This is one of the largest data leaks we've seen this year," said Dr. Sarah Chen, Chief Security Researcher at CyberDefense Labs. "The attackers gained access through a vulnerability in a popular third-party authentication service used by thousands of websites."
            </Typography>
            <Typography sx={{ color: '#555', lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
              Security experts recommend that all internet users take immediate action to protect their accounts by changing passwords, enabling two-factor authentication, and checking if their information has been compromised.
            </Typography>

            {/* CTA - Check if your data was leaked */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#fef3cd',
                border: '1px solid #ffc107',
                borderRadius: 2,
                p: 2.5,
                mb: 3,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
              }}
              onClick={() => navigate('/giveaway')}
            >
              <Typography sx={{ color: '#856404', fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                🔍 Check If Your Data Was Leaked
              </Typography>
              <Typography sx={{ color: '#856404', fontSize: '0.85rem', opacity: 0.8 }}>
                Enter your email to scan 12 billion breached records. Over 5 million people have already checked.
              </Typography>
            </Paper>

            {/* Related Article 1 */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#e8f5e9',
                border: '1px solid #a5d6a7',
                borderRadius: 2,
                p: 2,
                mb: 1.5,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
              }}
              onClick={() => navigate('/download')}
            >
              <Typography sx={{ color: '#27ae60', fontWeight: 700, fontSize: '0.9rem' }}>
                🛡️ FREE Security Tool — Check If Your Passwords Have Been Compromised
              </Typography>
              <Typography sx={{ color: '#27ae60', fontSize: '0.8rem', opacity: 0.7 }}>Download our free security scanner →</Typography>
            </Paper>

            {/* Related Article 2 */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#e3f2fd',
                border: '1px solid #90caf9',
                borderRadius: 2,
                p: 2,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
              }}
              onClick={() => navigate('/quiz')}
            >
              <Typography sx={{ color: '#1565c0', fontWeight: 700, fontSize: '0.9rem' }}>
                🧠 Quick Quiz: Are You Practicing Safe Online Habits? Take Our 2-Minute Test
              </Typography>
            </Paper>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card elevation={0} sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
              Comments (247)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Leave a comment..."
              sx={{ mb: 2 }}
            />
            {[
              { name: 'TechWizard42', text: 'Everyone should be using a password manager! This is why.', time: '12m ago', likes: 47 },
              { name: 'SarahM_Dev', text: 'Checked my email and it was in the breach. Thanks for the heads up!', time: '45m ago', likes: 23 },
              { name: 'CyberSec_Pro', text: 'The fact that companies still store passwords in plain text is terrifying.', time: '1h ago', likes: 89 },
            ].map((comment, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, py: 1.5, borderTop: '1px solid #eee' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0e0e0', color: '#666', fontSize: '0.8rem' }}>
                  {comment.name[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>{comment.name}</Typography>
                    <Typography sx={{ color: '#aaa', fontSize: '0.7rem' }}>{comment.time}</Typography>
                  </Box>
                  <Typography sx={{ color: '#555', fontSize: '0.85rem', mt: 0.3 }}>{comment.text}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                    <Typography sx={{ color: '#888', fontSize: '0.75rem', cursor: 'pointer', '&:hover': { color: '#1a73e8' } }}>👍 {comment.likes}</Typography>
                    <Typography sx={{ color: '#888', fontSize: '0.75rem', cursor: 'pointer', '&:hover': { color: '#1a73e8' } }}>💬 Reply</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}