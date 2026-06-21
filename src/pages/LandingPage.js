import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Container, Grid, Card, CardContent,
  Chip, Paper, BottomNavigation, BottomNavigationAction
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedIcon from '@mui/icons-material/Verified';
import harvester from '../harvester/HarvesterCore';

const tools = [
  {
    id: 1,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>,
    title: 'Network Scanner',
    desc: 'Professional-grade WiFi and network vulnerability assessment toolkit for security researchers.',
    path: '/wifi-hacking',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
  },
  {
    id: 2,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>,
    title: 'Mobile Security',
    desc: 'Complete Android & iOS security testing framework with real-time monitoring capabilities.',
    path: '/android-hacking',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)'
  },
  {
    id: 3,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
    title: 'System Exploitation',
    desc: 'Multi-platform penetration testing framework with undetectable payload generation.',
    path: '/system-hacking',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #047857)'
  },
  {
    id: 4,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
    title: 'Phishing Simulation',
    desc: 'Enterprise phishing simulation platform for advanced social engineering testing.',
    path: '/login',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)'
  },
];

const stats = [
  { value: '847', label: 'Active Researchers', icon: '👥' },
  { value: '50+', label: 'Security Tools', icon: '🛠️' },
  { value: '99.7%', label: 'Uptime Guarantee', icon: '🎯' },
  { value: '24/7', label: 'Community Support', icon: '🆘' },
];

const features = [
  {
    icon: '🔬',
    title: 'Vulnerability Assessment',
    desc: 'Automated scanning and manual testing tools to identify security weaknesses in your infrastructure.',
    gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)'
  },
  {
    icon: '📊',
    title: 'Comprehensive Reporting',
    desc: 'Detailed reports with actionable insights, risk scoring, and remediation recommendations.',
    gradient: 'linear-gradient(135deg, #059669, #10b981)'
  },
  {
    icon: '🔒',
    title: 'Secure Environment',
    desc: 'All testing is conducted in isolated, encrypted environments with strict access controls.',
    gradient: 'linear-gradient(135deg, #dc2626, #ef4444)'
  },
  {
    icon: '🎓',
    title: 'Learning Resources',
    desc: 'Curated educational content, tutorials, and hands-on labs for skill development.',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)'
  },
  {
    icon: '🤝',
    title: 'Community Network',
    desc: 'Connect with thousands of security researchers and share knowledge in our community.',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)'
  },
  {
    icon: '⚡',
    title: 'Regular Updates',
    desc: 'Tools and resources updated weekly to keep pace with the latest security threats.',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)'
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    harvester.init();
    setMounted(true);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* ====== REUSABLE NAVBAR ====== */}

      <Container maxWidth="lg">
        {/* ====== HERO SECTION ====== */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #1e3a5f 100%)',
            borderRadius: '20px', p: { xs: 3, md: 6 }, mb: 4,
            position: 'relative', overflow: 'hidden'
          }}
        >
          {/* Background decorative elements */}
          <Box sx={{
            position: 'absolute', top: -150, right: -150, width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)'
          }} />
          <Box sx={{
            position: 'absolute', bottom: -100, left: -100, width: 350, height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)'
          }} />
          <Box sx={{
            position: 'absolute', top: 100, left: '30%', width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)'
          }} />
          
          <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label="OPEN BETA" 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(37,99,235,0.2)', 
                    color: '#93c5fd', 
                    fontWeight: 700, 
                    fontSize: '0.65rem', 
                    height: 24,
                    border: '1px solid rgba(37,99,235,0.3)'
                  }} 
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    v2.4.1 • 847 researchers active
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h3" sx={{ 
                color: '#fff', fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.8rem' }, 
                lineHeight: 1.15, mb: 2, letterSpacing: '-1px'
              }}>
                Professional Security{' '}
                <Box component="span" sx={{ 
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Assessment</Box>
                {' '}Platform
              </Typography>
              
              <Typography sx={{ 
                color: 'rgba(255,255,255,0.6)', 
                fontSize: { xs: '0.95rem', md: '1.05rem' }, 
                maxWidth: 540, mb: 3.5, lineHeight: 1.7 
              }}>
                Enterprise-grade penetration testing tools, vulnerability scanners, and security training resources.
                Built for security professionals, trusted by organizations worldwide.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/wifi-hacking')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff', fontWeight: 700, borderRadius: '12px', 
                    px: 3.5, py: 1.3, textTransform: 'none', fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                      boxShadow: '0 6px 20px rgba(37,99,235,0.4)'
                    }
                  }}
                >
                  Explore Tools
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/download')}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.15)', 
                    color: '#e2e8f0', borderRadius: '12px', 
                    px: 3.5, py: 1.3, textTransform: 'none', fontSize: '0.95rem',
                    borderWidth: '1.5px',
                    '&:hover': { 
                      borderColor: 'rgba(255,255,255,0.3)', 
                      bgcolor: 'rgba(255,255,255,0.04)' 
                    } 
                  }}
                >
                  View Resources
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{
                  width: 180, height: 180, mx: 'auto', mb: 3,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.08))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(20px)',
                  position: 'relative'
                }}>
                  <ShieldIcon sx={{ fontSize: 80, color: 'rgba(96,165,250,0.6)' }} />
                  <Box sx={{
                    position: 'absolute',
                    top: -8, right: -8,
                    bgcolor: '#22c55e',
                    borderRadius: '50%',
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(34,197,94,0.4)'
                  }}>
                    <VerifiedIcon sx={{ color: '#fff', fontSize: 16 }} />
                  </Box>
                </Box>
                <Paper sx={{ 
                  bgcolor: 'rgba(255,255,255,0.04)', 
                  backdropFilter: 'blur(10px)', 
                  borderRadius: '12px', 
                  p: 2, 
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Chip label="SOC 2" size="small" sx={{ bgcolor: 'rgba(37,99,235,0.2)', color: '#60a5fa', fontWeight: 600, fontSize: '0.7rem' }} />
                  <Chip label="GDPR" size="small" sx={{ bgcolor: 'rgba(5,150,105,0.2)', color: '#34d399', fontWeight: 600, fontSize: '0.7rem' }} />
                  <Chip label="ISO 27001" size="small" sx={{ bgcolor: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 600, fontSize: '0.7rem' }} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* ====== STATS BAR ====== */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: '#fff', borderRadius: '16px', p: { xs: 2, md: 3 }, mb: 5, 
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <Grid container spacing={2} justifyContent="center">
            {stats.map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ textAlign: 'center', py: 1.5 }}>
                  <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>{stat.icon}</Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.3rem', md: '1.6rem' }
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500, mt: 0.3 }}>{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* ====== MAIN TOOLS SECTION ====== */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ width: 4, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #2563eb, #7c3aed)' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: '-0.5px' }}>
                Security Assessment Tools
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.3 }}>
                Professional-grade tools for comprehensive security testing
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {tools.map((tool) => (
              <Grid item xs={12} sm={6} md={3} key={tool.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '16px', height: '100%', cursor: 'pointer', overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&:hover': { 
                      transform: 'translateY(-6px)', 
                      boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                      borderColor: `${tool.color}30`
                    }
                  }}
                  onClick={() => navigate(tool.path)}
                >
                  <Box sx={{ 
                    height: 4, 
                    background: tool.gradient,
                    width: '100%'
                  }} />
                  <Box sx={{ p: 3, pb: 2.5 }}>
                    <Box sx={{
                      width: 52, height: 52, borderRadius: '14px', mb: 2,
                      background: `${tool.color}12`,
                      color: tool.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${tool.color}20`
                    }}>
                      {tool.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', mb: 1 }}>
                      {tool.title}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.825rem', lineHeight: 1.6, mb: 2 }}>
                      {tool.desc}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ color: tool.color, fontWeight: 600, fontSize: '0.85rem' }}>
                        Access tool
                      </Typography>
                      <ArrowForwardIcon sx={{ fontSize: 14, color: tool.color }} />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ====== FEATURES SECTION ====== */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ width: 4, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #059669, #10b981)' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: '-0.5px' }}>
                Platform Features
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.3 }}>
                Everything you need for professional security testing
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {features.map((feat, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper elevation={0} sx={{
                  p: 3, borderRadius: '16px', border: '1px solid #e2e8f0',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    borderColor: '#2563eb', 
                    boxShadow: '0 8px 32px rgba(37,99,235,0.06)',
                    transform: 'translateY(-2px)' 
                  }
                }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '12px', mb: 2,
                    background: feat.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {feat.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', mb: 0.8 }}>{feat.title}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.7 }}>{feat.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ====== CTA BANNER ====== */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a5f 100%)',
            borderRadius: '20px', p: { xs: 3, md: 5 }, textAlign: 'center', mb: 4,
            position: 'relative', overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute', top: -50, right: -50, width: 300, height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)'
          }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" sx={{ 
              color: '#fff', fontWeight: 800, mb: 1.5, 
              fontSize: { xs: '1.3rem', md: '1.8rem' },
              letterSpacing: '-0.5px'
            }}>
              Start Your Security Assessment
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3.5, maxWidth: 520, mx: 'auto', fontSize: { xs: '0.9rem', md: '0.95rem' }, lineHeight: 1.7 }}>
              Access professional-grade security tools and resources. No registration required for basic features. Start testing today.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/wifi-hacking')}
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff', fontWeight: 700, borderRadius: '12px', 
                  px: 3.5, py: 1.2, textTransform: 'none', fontSize: '0.95rem',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/download')}
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.15)', 
                  color: '#e2e8f0', borderRadius: '12px', 
                  px: 3.5, py: 1.2, textTransform: 'none', fontSize: '0.95rem',
                  '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.04)' }
                }}
              >
                Browse Resources
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* ====== REUSABLE FOOTER ====== */}
        {/* <Footer /> */}
      </Container>

      {/* Mobile Bottom Nav */}
      <Paper sx={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        display: { md: 'none' }, zIndex: 1000,
        borderTop: '1px solid #e2e8f0',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden'
      }} elevation={8}>
        <BottomNavigation 
          showLabels 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(12px)',
            height: 64,
            '& .MuiBottomNavigationAction-label': { fontSize: '0.6rem', fontWeight: 600, mt: 0.3 },
            '& .Mui-selected': { color: '#2563eb !important' },
            '& .MuiBottomNavigationAction-root': { minWidth: 0 }
          }}
        >
          <BottomNavigationAction label="Home" icon={<SecurityIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Scanner" icon={<span style={{ fontSize: 18 }}>📶</span>} onClick={() => navigate('/wifi-hacking')} />
          <BottomNavigationAction label="Mobile" icon={<span style={{ fontSize: 18 }}>📱</span>} onClick={() => navigate('/android-hacking')} />
          <BottomNavigationAction label="Labs" icon={<span style={{ fontSize: 18 }}>💻</span>} onClick={() => navigate('/system-hacking')} />
          <BottomNavigationAction label="Resources" icon={<span style={{ fontSize: 18 }}>📄</span>} onClick={() => navigate('/download')} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}