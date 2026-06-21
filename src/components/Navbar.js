import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Container, Typography, Box, Button,
  IconButton, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, useTheme, useMediaQuery, Slide,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WifiIcon from '@mui/icons-material/Wifi';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TerminalIcon from '@mui/icons-material/Terminal';
import DescriptionIcon from '@mui/icons-material/Description';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

const navLinks = [
  { label: 'Network Scanner', path: '/wifi-hacking', icon: WifiIcon },
  { label: 'Mobile Security', path: '/android-hacking', icon: SmartphoneIcon },
  { label: 'Training Labs', path: '/system-hacking', icon: TerminalIcon },
  { label: 'Resources', path: '/download', icon: DescriptionIcon },
];

// Hide the bar on scroll-down, reveal on scroll-up (nice on mobile, keeps content visible)
function HideOnScroll({ children }) {
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 80);
      setLastY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  return (
    <Slide appear={false} direction="down" in={!hidden}>
      {children}
    </Slide>
  );
}

export default function Header({ transparent = false, showAuditBtn = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile drawer whenever route changes
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const goTo = useCallback((path) => {
    navigate(path);
    setMobileMenuOpen(false);
  }, [navigate]);

  // Visual theme: solid once scrolled, even if "transparent" was requested for hero pages
  const isSolid = !transparent || scrolled;
  const textColor = isSolid ? '#0f172a' : '#fff';
  const subTextColor = isSolid ? '#94a3b8' : 'rgba(255,255,255,0.55)';
  const linkColor = isSolid ? '#475569' : 'rgba(255,255,255,0.75)';
  const linkHoverColor = isSolid ? '#2563eb' : '#fff';

  return (
    <>
      <HideOnScroll>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: isSolid ? 'rgba(255,255,255,0.85)' : 'transparent',
            backdropFilter: isSolid ? 'blur(16px)' : 'none',
            WebkitBackdropFilter: isSolid ? 'blur(16px)' : 'none',
            boxShadow: scrolled ? '0 1px 3px rgba(15,23,42,0.06)' : 'none',
            borderBottom: isSolid ? '1px solid rgba(0,0,0,0.04)' : 'none',
            color: textColor,
            transition: 'background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
            <Toolbar
              disableGutters
              sx={{ minHeight: { xs: 56, sm: 64 } }}
            >
              {/* Logo */}
              <Box
                role="button"
                tabIndex={0}
                aria-label="SecLabs home"
                onClick={() => goTo('/')}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goTo('/')}
                sx={{
                  display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 },
                  cursor: 'pointer', outline: 'none', flexShrink: 0,
                  '&:hover .logo-icon': { transform: 'scale(1.05)' },
                }}
              >
                <Box
                  className="logo-icon"
                  sx={{
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    borderRadius: '12px',
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <ShieldIcon sx={{ color: '#fff', fontSize: { xs: 18, sm: 20 } }} />
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800, color: textColor,
                      fontSize: { xs: '1rem', sm: '1.15rem' },
                      letterSpacing: '-0.5px', lineHeight: 1.2, whiteSpace: 'nowrap',
                    }}
                  >
                    Sec<span style={{ color: isSolid ? '#2563eb' : '#93c5fd' }}>Labs</span>
                  </Typography>
                  <Typography
                    sx={{
                      color: subTextColor,
                      fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.3px',
                      display: { xs: 'none', sm: 'block' },
                      whiteSpace: 'nowrap',
                    }}
                  >
                    SECURITY ASSESSMENT PLATFORM
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              {/* Desktop Links */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
                {navLinks.map(({ label, path, icon: Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Button
                      key={path}
                      onClick={() => goTo(path)}
                      startIcon={<Icon sx={{ fontSize: 17 }} />}
                      sx={{
                        color: active ? (isSolid ? '#2563eb' : '#fff') : linkColor,
                        fontWeight: active ? 700 : 500,
                        fontSize: '0.85rem',
                        py: 0.7, px: 1.5,
                        borderRadius: '8px',
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        bgcolor: active
                          ? (isSolid ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.12)')
                          : 'transparent',
                        '&:hover': {
                          color: linkHoverColor,
                          bgcolor: isSolid ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.08)',
                        },
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}

                {showAuditBtn && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => goTo('/giveaway')}
                      startIcon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                        color: '#fff', fontWeight: 700, borderRadius: '10px',
                        px: 2.5, py: 0.7, fontSize: '0.8rem', textTransform: 'none',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #b91c1c, #dc2626)',
                          boxShadow: '0 6px 20px rgba(220, 38, 38, 0.35)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      Security Audit
                    </Button>
                  </>
                )}
              </Box>

              {/* Mobile Menu Button */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}>
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    color: isSolid ? '#64748b' : 'rgba(255,255,255,0.85)',
                    bgcolor: isSolid ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: isSolid ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.16)' },
                  }}
                >
                  <MenuIcon fontSize={isMobile ? 'small' : 'medium'} />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: { xs: '85vw', sm: 360 },
            maxWidth: 380,
            bgcolor: '#0f172a',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer header */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                borderRadius: '10px', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                Sec<span style={{ color: '#93c5fd' }}>Labs</span>
              </Typography>
            </Box>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Links */}
          <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
            {navLinks.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <ListItemButton
                  key={path}
                  onClick={() => goTo(path)}
                  sx={{
                    borderRadius: '12px', mb: 0.5, py: 1.3,
                    bgcolor: active ? 'rgba(37,99,235,0.18)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box sx={{
                      width: 34, height: 34, borderRadius: '9px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: active
                        ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                        : 'rgba(255,255,255,0.08)',
                    }}>
                      <Icon sx={{ fontSize: 18, color: '#fff' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.92rem',
                      color: '#fff',
                    }}
                  />
                  <ChevronRightIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.35)' }} />
                </ListItemButton>
              );
            })}
          </List>

          {showAuditBtn && (
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button
                fullWidth
                onClick={() => goTo('/giveaway')}
                startIcon={<CardGiftcardIcon sx={{ fontSize: 19 }} />}
                endIcon={<ChevronRightIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  color: '#fff', fontWeight: 700, borderRadius: '12px',
                  py: 1.4, fontSize: '0.92rem', textTransform: 'none',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 20px rgba(220, 38, 38, 0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #b91c1c, #dc2626)' },
                }}
              >
                Security Audit
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}