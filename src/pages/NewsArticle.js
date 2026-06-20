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
      <AppBar position="sticky" sx={{ 
        bgcolor: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', 
        color: '#333',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Container maxWidth="md">
          <Toolbar sx={{ px: { xs: 0 } }} disableGutters>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px',
                bgcolor: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>N</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#0f172a', cursor: 'pointer', fontSize: '1.2rem', letterSpacing: '-0.3px' }}>
                News<span style={{ color: '#1a73e8' }}>Hub</span>
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => navigate('/giveaway')} 
              sx={{ 
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                fontSize: '0.78rem',
                boxShadow: '0 2px 8px rgba(220,38,38,0.2)',
                '&:hover': { background: 'linear-gradient(135deg, #b91c1c, #dc2626)' }
              }}
            >
              🎁 Free iPhone
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3, px: { xs: 2, md: 3 } }}>
        {/* Article Header */}
        <Card elevation={0} sx={{ 
          bgcolor: '#fff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          mb: 3,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label="EXCLUSIVE" size="small" sx={{ bgcolor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
              <Chip label="DATA BREACH" size="small" sx={{ bgcolor: '#0f172a', color: '#e2e8f0', fontWeight: 600, fontSize: '0.65rem', height: 22 }} />
              <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', ml: 'auto', fontWeight: 500 }}>23 minutes ago</Typography>
            </Box>

            <Typography variant="h4" sx={{ 
              fontWeight: 800, color: '#0f172a', mb: 2.5, 
              lineHeight: 1.3, fontSize: { xs: '1.4rem', md: '2rem' },
              letterSpacing: '-0.3px'
            }}>
              Massive Data Leak Exposes Millions of Passwords — Is Yours on the List?
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Avatar sx={{ bgcolor: '#1a73e8', color: '#fff', fontWeight: 700, width: 40, height: 40 }}>NI</Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>NewsHub Investigates</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>Security Desk • 847K reads</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />

            {/* Article Image Placeholder */}
            <Box
              sx={{
                height: { xs: 200, md: 240 },
                bgcolor: '#e8eaf6',
                borderRadius: '12px',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(26,115,232,0.03), rgba(124,58,237,0.03))'
              }} />
              <Typography sx={{ fontSize: '5rem', opacity: 0.4, position: 'relative', zIndex: 1 }}>🔓</Typography>
              <Chip 
                label="Photo: Security researchers analyzing data" 
                size="small" 
                sx={{ 
                  position: 'absolute', bottom: 10, left: 10, 
                  bgcolor: 'rgba(0,0,0,0.6)', 
                  color: '#fff', 
                  fontSize: '0.65rem',
                  height: 22
                }} 
              />
            </Box>

            <Typography sx={{ color: '#475569', lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
              A massive security breach has compromised the personal data of over 87 million users worldwide, according to cybersecurity researchers who discovered the incident earlier this week. The breach exposed email addresses, encrypted passwords, phone numbers, and in some cases, full credit card details.
            </Typography>
            <Typography sx={{ color: '#475569', lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
              "This is one of the largest data leaks we've seen this year," said Dr. Sarah Chen, Chief Security Researcher at CyberDefense Labs. "The attackers gained access through a vulnerability in a popular third-party authentication service used by thousands of websites."
            </Typography>
            <Typography sx={{ color: '#475569', lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
              Security experts recommend that all internet users take immediate action to protect their accounts by changing passwords, enabling two-factor authentication, and checking if their information has been compromised.
            </Typography>

            {/* CTA - Check if your data was leaked */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#fef3cd',
                border: '1px solid #ffc107',
                borderRadius: '14px',
                p: 2.5,
                mb: 2.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' }
              }}
              onClick={() => navigate('/giveaway')}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Typography sx={{ fontSize: '1.5rem' }}>🔍</Typography>
                <Box>
                  <Typography sx={{ color: '#854d0e', fontWeight: 700, fontSize: '1rem', mb: 0.3 }}>
                    Check If Your Data Was Leaked
                  </Typography>
                  <Typography sx={{ color: '#854d0e', fontSize: '0.85rem', opacity: 0.8 }}>
                    Enter your email to scan 12 billion breached records. Over 5 million people have already checked.
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Related Article 1 */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '14px',
                p: 2,
                mb: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' }
              }}
              onClick={() => navigate('/download')}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>🛡️</Typography>
                <Box>
                  <Typography sx={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem' }}>
                    FREE Security Tool — Check If Your Passwords Have Been Compromised
                  </Typography>
                  <Typography sx={{ color: '#059669', fontSize: '0.8rem', opacity: 0.7 }}>Download our free security scanner →</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Related Article 2 */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#eff6ff',
                border: '1px solid #93c5fd',
                borderRadius: '14px',
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' }
              }}
              onClick={() => navigate('/quiz')}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>🧠</Typography>
                <Box>
                  <Typography sx={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.9rem' }}>
                    Quick Quiz: Are You Practicing Safe Online Habits? Take Our 2-Minute Test
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card elevation={0} sx={{ 
          bgcolor: '#fff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          mb: 3
        }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, fontSize: '1.05rem' }}>
              Comments (247)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Leave a comment..."
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&.Mui-focused fieldset': { borderColor: '#1a73e8' },
                }
              }}
            />
            {[
              { name: 'TechWizard42', text: 'Everyone should be using a password manager! This is why.', time: '12m ago', likes: 47 },
              { name: 'SarahM_Dev', text: 'Checked my email and it was in the breach. Thanks for the heads up!', time: '45m ago', likes: 23 },
              { name: 'CyberSec_Pro', text: 'The fact that companies still store passwords in plain text is terrifying.', time: '1h ago', likes: 89 },
            ].map((comment, i) => (
              <Box key={i} sx={{ 
                display: 'flex', gap: 1.5, 
                py: 2, 
                borderTop: '1px solid #e2e8f0'
              }}>
                <Avatar sx={{ 
                  width: 36, height: 36, 
                  bgcolor: '#e2e8f0', 
                  color: '#64748b', 
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {comment.name[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{comment.name}</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>{comment.time}</Typography>
                  </Box>
                  <Typography sx={{ color: '#475569', fontSize: '0.87rem', mt: 0.3, lineHeight: 1.5 }}>{comment.text}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 0.8 }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer', '&:hover': { color: '#1a73e8' } }}>
                      👍 {comment.likes}
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer', '&:hover': { color: '#1a73e8' } }}>
                      💬 Reply
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Footer note */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            © 2026 NewsHub. All rights reserved. Independent journalism.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}