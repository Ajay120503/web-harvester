import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Container, Typography, Box, Button,
  IconButton, Fade, Badge, Slide
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const navLinks = [
  { label: 'Network Scanner', path: '/wifi-hacking', icon: '📶' },
  { label: 'Mobile Security', path: '/android-hacking', icon: '📱' },
  { label: 'Training Labs', path: '/system-hacking', icon: '💻' },
  { label: 'Resources', path: '/download', icon: '📄' },
];

export default function Navbar({ transparent = false, showAuditBtn = true, elevation = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: transparent ? 'transparent' : 'rgba(255,255,255,0.85)', 
        backdropFilter: transparent ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(16px)',
        boxShadow: elevation > 0 ? `0 1px 3px rgba(0,0,0,${0.06 * elevation})` : 'none', 
        color: transparent ? '#fff' : '#1e293b',
        borderBottom: transparent ? 'none' : '1px solid rgba(0,0,0,0.04)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 0 }, minHeight: { xs: 56, md: 64 } }} disableGutters>
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', alignItems: 'center', gap: 1.5, 
              cursor: 'pointer', textDecoration: 'none',
              '&:hover .logo-icon': { transform: 'scale(1.05)' }
            }} 
            onClick={() => navigate('/')}
          >
            <Box 
              className="logo-icon"
              sx={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                borderRadius: '12px', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                transition: 'transform 0.2s'
              }}
            >
              <ShieldIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ 
                fontWeight: 800, 
                color: transparent ? '#fff' : '#0f172a', 
                fontSize: '1.15rem', 
                letterSpacing: '-0.5px', 
                lineHeight: 1.2 
              }}>
                Sec<span style={{ color: transparent ? '#93c5fd' : '#2563eb' }}>Labs</span>
              </Typography>
              <Typography sx={{ 
                color: transparent ? 'rgba(255,255,255,0.5)' : '#94a3b8', 
                fontSize: '0.6rem', 
                fontWeight: 500, 
                letterSpacing: '0.3px' 
              }}>
                SECURITY ASSESSMENT PLATFORM
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          
          {/* Desktop Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
            {navLinks.map(link => (
              <Button
                key={link.path}
                onClick={() => navigate(link.path)}
                sx={{
                  color: transparent ? 'rgba(255,255,255,0.7)' : '#475569', 
                  fontWeight: location.pathname === link.path ? 700 : 500, 
                  fontSize: '0.85rem',
                  py: 0.6, px: 1.5, 
                  borderRadius: '8px',
                  textTransform: 'none',
                  transition: 'all 0.15s',
                  bgcolor: location.pathname === link.path 
                    ? (transparent ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.06)') 
                    : 'transparent',
                  '&:hover': { 
                    color: transparent ? '#fff' : '#2563eb', 
                    bgcolor: transparent ? 'rgba(255,255,255,0.08)' : 'rgba(37,99,235,0.06)' 
                  }
                }}
              >
                {link.label}
              </Button>
            ))}
            
            {showAuditBtn && (
              <>
                <Box sx={{ 
                  width: 1, height: 24, 
                  bgcolor: transparent ? 'rgba(255,255,255,0.15)' : '#e2e8f0', 
                  mx: 1 
                }} />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/giveaway')}
                  sx={{
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    color: '#fff', fontWeight: 700, borderRadius: '10px',
                    px: 2.5, py: 0.7, fontSize: '0.8rem', textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #b91c1c, #dc2626)',
                      boxShadow: '0 6px 20px rgba(220, 38, 38, 0.35)'
                    },
                    animation: 'pulse 3s ease-in-out infinite'
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Security Audit
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { md: 'none' }, ml: 'auto' }}>
            <IconButton 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              sx={{ 
                color: transparent ? 'rgba(255,255,255,0.7)' : '#64748b',
                bgcolor: mobileMenuOpen 
                  ? (transparent ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') 
                  : 'transparent',
                '&:hover': { 
                  bgcolor: transparent ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' 
                }
              }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Menu */}
      <Fade in={mobileMenuOpen}>
        <Box sx={{ 
          display: { md: 'none' }, 
          bgcolor: transparent ? 'rgba(15,23,42,0.98)' : '#fff', 
          borderTop: transparent ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', 
          py: 1, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          backdropFilter: transparent ? 'blur(20px)' : 'none'
        }}>
          <Container>
            {[
              ...navLinks,
              ...(showAuditBtn ? [{ label: '★ Security Audit', path: '/giveaway', icon: '🎁', highlight: true }] : []),
            ].map(link => (
              <Box
                key={link.path}
                onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                sx={{ 
                  py: 1.2, px: 2, cursor: 'pointer', 
                  borderRadius: '10px', 
                  color: link.highlight 
                    ? (transparent ? '#fca5a5' : '#dc2626') 
                    : (transparent ? 'rgba(255,255,255,0.7)' : '#475569'), 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  fontWeight: link.highlight ? 700 : 500,
                  bgcolor: location.pathname === link.path 
                    ? (transparent ? 'rgba(255,255,255,0.06)' : '#f1f5f9') 
                    : 'transparent',
                  '&:hover': { 
                    bgcolor: transparent ? 'rgba(255,255,255,0.1)' : '#f1f5f9' 
                  } 
                }}
              >
                <Typography sx={{ fontSize: '1.2rem' }}>{link.icon}</Typography>
                <Typography sx={{ fontWeight: link.highlight ? 700 : 500, fontSize: '0.9rem' }}>
                  {link.label}
                </Typography>
              </Box>
            ))}
          </Container>
        </Box>
      </Fade>
    </AppBar>
  );
}