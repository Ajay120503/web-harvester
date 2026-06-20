import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography, Divider } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';

export default function Footer({ simple = false, dark = false }) {
  const navigate = useNavigate();

  const linkSx = (path) => ({
    color: dark ? 'rgba(255,255,255,0.5)' : '#64748b', 
    fontSize: '0.85rem', 
    mb: 1.2, 
    cursor: 'pointer', 
    transition: 'color 0.15s',
    '&:hover': { 
      color: dark ? '#93c5fd' : '#2563eb' 
    },
    display: 'flex',
    alignItems: 'center',
    gap: 0.5
  });

  const sectionTitleSx = {
    fontWeight: 700, 
    color: dark ? 'rgba(255,255,255,0.9)' : '#0f172a', 
    mb: 2.5, 
    fontSize: '0.8rem', 
    textTransform: 'uppercase', 
    letterSpacing: '0.8px'
  };

  if (simple) {
    return (
      <Box sx={{ 
        mt: 4, pt: 3, pb: 3, 
        borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
        bgcolor: dark ? 'rgba(0,0,0,0.2)' : 'transparent'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                borderRadius: '8px', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShieldIcon sx={{ color: '#fff', fontSize: 16 }} />
              </Box>
              <Typography sx={{ 
                fontWeight: 700, 
                color: dark ? 'rgba(255,255,255,0.8)' : '#0f172a', 
                fontSize: '0.9rem' 
              }}>
                Sec<span style={{ color: dark ? '#93c5fd' : '#2563eb' }}>Labs</span>
              </Typography>
            </Box>
            <Typography sx={{ 
              color: dark ? 'rgba(255,255,255,0.35)' : '#94a3b8', 
              fontSize: '0.78rem' 
            }}>
              © 2026 SecLabs. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      mt: 6, pt: 5, pb: 3, 
      borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
      bgcolor: dark ? 'rgba(0,0,0,0.15)' : 'transparent'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                borderRadius: '10px', width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
              }}>
                <ShieldIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography sx={{ 
                fontWeight: 800, 
                color: dark ? '#fff' : '#0f172a', 
                fontSize: '1.1rem',
                letterSpacing: '-0.3px'
              }}>
                Sec<span style={{ color: dark ? '#93c5fd' : '#2563eb' }}>Labs</span>
              </Typography>
            </Box>
            <Typography sx={{ 
              color: dark ? 'rgba(255,255,255,0.45)' : '#64748b', 
              fontSize: '0.85rem', 
              lineHeight: 1.7, 
              mb: 2.5,
              maxWidth: 280
            }}>
              Professional security assessment platform trusted by security researchers and organizations worldwide.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { icon: '𝕏', label: 'Twitter' },
                { icon: '💼', label: 'LinkedIn' },
                { icon: '📧', label: 'Email' },
                { icon: '💬', label: 'Discord' },
              ].map((item, i) => (
                <Box key={i} sx={{
                  width: 36, height: 36, borderRadius: '10px',
                  bgcolor: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: dark ? 'rgba(37,99,235,0.2)' : '#e2e8f0',
                    transform: 'translateY(-2px)'
                  },
                  title: item.label
                }}>
                  <Typography sx={{ 
                    fontSize: '1rem',
                    color: dark ? 'rgba(255,255,255,0.6)' : '#64748b'
                  }}>
                    {item.icon}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Platform Links */}
          <Grid item xs={6} md={2}>
            <Typography sx={{ ...sectionTitleSx }}>Platform</Typography>
            {[
              { label: 'Network Scanner', path: '/wifi-hacking' },
              { label: 'Mobile Security', path: '/android-hacking' },
              { label: 'Training Labs', path: '/system-hacking' },
              { label: 'Resources', path: '/download' },
            ].map((item, i) => (
              <Typography key={i} sx={linkSx(item.path)} onClick={() => navigate(item.path)}>
                <Box component="span" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>▸</Box>
                {item.label}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography sx={{ ...sectionTitleSx }}>Learn</Typography>
            {['Documentation', 'API Reference', 'Tutorials', 'Community'].map((item, i) => (
              <Typography key={i} sx={{ ...linkSx(), cursor: 'default' }}>
                <Box component="span" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>▸</Box>
                {item}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography sx={{ ...sectionTitleSx }}>Company</Typography>
            {['About', 'Blog', 'Careers', 'Contact'].map((item, i) => (
              <Typography key={i} sx={{ ...linkSx(), cursor: 'default' }}>
                <Box component="span" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>▸</Box>
                {item}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography sx={{ ...sectionTitleSx }}>Legal</Typography>
            {[
              { label: 'Privacy Policy', path: '#' },
              { label: 'Terms of Service', path: '#' },
              { label: 'Cookie Policy', path: '#' },
              { label: 'GDPR', path: '#' },
            ].map((item, i) => (
              <Typography key={i} sx={linkSx(item.path)} onClick={() => {}}>
                <Box component="span" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>▸</Box>
                {item.label}
              </Typography>
            ))}
          </Grid>
        </Grid>

        <Box sx={{ 
          textAlign: 'center', 
          mt: 4, 
          mb: 2, 
          pt: 3, 
          borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' 
        }}>
          <Typography sx={{ 
            color: dark ? 'rgba(255,255,255,0.3)' : '#94a3b8', 
            fontSize: '0.8rem',
            lineHeight: 1.6
          }}>
            © 2026 SecLabs. All tools are intended for authorized security testing and educational purposes only.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}