import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography, IconButton, Stack } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const platformLinks = [
  { label: 'Network Scanner', path: '/wifi-hacking' },
  { label: 'Mobile Security', path: '/android-hacking' },
  { label: 'Training Labs', path: '/system-hacking' },
  { label: 'Resources', path: '/download' },
];

const learnLinks = ['Documentation', 'API Reference', 'Tutorials', 'Community'];
const companyLinks = ['About', 'Blog', 'Careers', 'Contact'];
const legalLinks = ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'];

const socials = [
  { Icon: XIcon, label: 'X (Twitter)', href: '#' },
  { Icon: LinkedInIcon, label: 'LinkedIn', href: '#' },
  { Icon: EmailIcon, label: 'Email', href: '#' },
  { Icon: ChatIcon, label: 'Discord', href: '#' },
];

export default function Footer({ simple = false, dark = false }) {
  const navigate = useNavigate();

  const linkSx = {
    color: dark ? 'rgba(255,255,255,0.55)' : '#64748b',
    fontSize: '0.85rem',
    mb: 1.3,
    cursor: 'pointer',
    transition: 'color 0.15s, transform 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    width: 'fit-content',
    '&:hover': {
      color: dark ? '#93c5fd' : '#2563eb',
      transform: 'translateX(2px)',
    },
  };

  const staticLinkSx = {
    ...linkSx,
    cursor: 'default',
    '&:hover': {},
  };

  const sectionTitleSx = {
    fontWeight: 700,
    color: dark ? 'rgba(255,255,255,0.9)' : '#0f172a',
    mb: { xs: 1.5, md: 2.5 },
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  };

  const Brand = ({ iconSize = 34, fontSize = '1.1rem' }) => (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => navigate('/')}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/')}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', width: 'fit-content', outline: 'none' }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          borderRadius: '10px',
          width: iconSize, height: iconSize,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
          flexShrink: 0,
        }}
      >
        <ShieldIcon sx={{ color: '#fff', fontSize: iconSize * 0.5 }} />
      </Box>
      <Typography sx={{ fontWeight: 800, color: dark ? '#fff' : '#0f172a', fontSize, letterSpacing: '-0.3px' }}>
        Sec<span style={{ color: dark ? '#93c5fd' : '#2563eb' }}>Labs</span>
      </Typography>
    </Box>
  );

  // ---- Simple footer ----
  if (simple) {
    return (
      <Box
        component="footer"
        sx={{
          mt: { xs: 3, md: 4 },
          py: { xs: 2.5, md: 3 },
          px: { xs: 2, sm: 0 },
          borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
          bgcolor: dark ? 'rgba(0,0,0,0.2)' : 'transparent',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
          >
            <Brand iconSize={28} fontSize="0.9rem" />
            <Typography sx={{ color: dark ? 'rgba(255,255,255,0.35)' : '#94a3b8', fontSize: '0.78rem', textAlign: { xs: 'center', sm: 'right' } }}>
              © 2026 SecLabs. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>
    );
  }

  // ---- Full footer ----
  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 4, md: 6 },
        pt: { xs: 4, md: 5 },
        pb: { xs: 2.5, md: 3 },
        borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
        bgcolor: dark ? 'rgba(0,0,0,0.15)' : 'transparent',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
        <Grid container spacing={{ xs: 4, md: 4 }}>
          {/* Brand Column */}
          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Brand />
            </Box>
            <Typography
              sx={{
                color: dark ? 'rgba(255,255,255,0.45)' : '#64748b',
                fontSize: '0.85rem',
                lineHeight: 1.7,
                mb: 2.5,
                maxWidth: { xs: '100%', sm: 340, md: 280 },
              }}
            >
              Professional security assessment platform trusted by security researchers and organizations worldwide.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {socials.map(({ Icon, label, href }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={href}
                  aria-label={label}
                  size="small"
                  sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    bgcolor: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    color: dark ? 'rgba(255,255,255,0.6)' : '#64748b',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: dark ? 'rgba(37,99,235,0.2)' : '#e2e8f0',
                      color: dark ? '#93c5fd' : '#2563eb',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Platform Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={sectionTitleSx}>Platform</Typography>
            {platformLinks.map((item) => (
              <Typography key={item.path} sx={linkSx} onClick={() => navigate(item.path)}>
                <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                {item.label}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={sectionTitleSx}>Learn</Typography>
            {learnLinks.map((item) => (
              <Typography key={item} sx={staticLinkSx}>
                <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                {item}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={sectionTitleSx}>Company</Typography>
            {companyLinks.map((item) => (
              <Typography key={item} sx={staticLinkSx}>
                <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                {item}
              </Typography>
            ))}
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={sectionTitleSx}>Legal</Typography>
            {legalLinks.map((item) => (
              <Typography key={item} sx={linkSx}>
                <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                {item}
              </Typography>
            ))}
          </Grid>
        </Grid>

        <Box
          sx={{
            textAlign: 'center',
            mt: { xs: 3, md: 4 },
            mb: { xs: 0.5, md: 2 },
            pt: { xs: 2.5, md: 3 },
            borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
          }}
        >
          <Typography
            sx={{
              color: dark ? 'rgba(255,255,255,0.3)' : '#94a3b8',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              px: { xs: 1, sm: 0 },
            }}
          >
            © 2026 SecLabs. All tools are intended for authorized security testing and educational purposes only.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}