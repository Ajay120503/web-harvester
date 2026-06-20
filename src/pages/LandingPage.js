import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Container, Grid, Card, CardContent,
  Chip, AppBar, Toolbar, IconButton, Divider, Paper,
  BottomNavigation, BottomNavigationAction
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School';
import BugReportIcon from '@mui/icons-material/BugReport';
import harvester from '../harvester/HarvesterCore';

const tools = [
  {
    id: 1,
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
    title: 'Network Security Scanner',
    desc: 'Comprehensive network vulnerability assessment and penetration testing toolkit for security professionals.',
    path: '/wifi-hacking',
    color: '#2563eb'
  },
  {
    id: 2,
    icon: <BugReportIcon sx={{ fontSize: 32 }} />,
    title: 'Mobile Security Framework',
    desc: 'Android and iOS application security testing platform with static and dynamic analysis capabilities.',
    path: '/android-hacking',
    color: '#7c3aed'
  },
  {
    id: 3,
    icon: <SchoolIcon sx={{ fontSize: 32 }} />,
    title: 'Security Education Labs',
    desc: 'Interactive cybersecurity labs and capture-the-flag challenges for learning and skill development.',
    path: '/system-hacking',
    color: '#059669'
  },
  {
    id: 4,
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>,
    title: 'Phishing Simulation',
    desc: 'Enterprise-grade phishing simulation and security awareness training platform for organizations.',
    path: '/login',
    color: '#dc2626'
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
  },
  {
    icon: '📊',
    title: 'Comprehensive Reporting',
    desc: 'Detailed reports with actionable insights, risk scoring, and remediation recommendations.',
  },
  {
    icon: '🔒',
    title: 'Secure Environment',
    desc: 'All testing is conducted in isolated, encrypted environments with strict access controls.',
  },
  {
    icon: '🎓',
    title: 'Learning Resources',
    desc: 'Curated educational content, tutorials, and hands-on labs for skill development.',
  },
  {
    icon: '🤝',
    title: 'Community Network',
    desc: 'Connect with thousands of security researchers and share knowledge in our community.',
  },
  {
    icon: '⚡',
    title: 'Regular Updates',
    desc: 'Tools and resources updated weekly to keep pace with the latest security threats and techniques.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    harvester.init();
    setMounted(true);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* ====== TOP NAVIGATION ====== */}
      <AppBar position="sticky" sx={{ bgcolor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', color: '#1e293b' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 }, minHeight: { xs: 56, md: 64 } }} disableGutters>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{
                bgcolor: '#2563eb', borderRadius: 1.5, width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.2rem', letterSpacing: '-0.3px' }}>
                Sec<span style={{ color: '#2563eb' }}>Labs</span>
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />
            
            {/* Desktop Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2.5, alignItems: 'center' }}>
              {[
                { label: 'Network Scanner', path: '/wifi-hacking' },
                { label: 'Mobile Security', path: '/android-hacking' },
                { label: 'Training Labs', path: '/system-hacking' },
                { label: 'Resources', path: '/download' },
              ].map(link => (
                <Box
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: '#64748b', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
                    py: 0.5, px: 1, borderRadius: 1,
                    transition: 'all 0.15s',
                    '&:hover': { color: '#2563eb', bgcolor: '#f1f5f9' }
                  }}
                >
                  {link.label}
                </Box>
              ))}
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/giveaway')}
                sx={{
                  bgcolor: '#dc2626', color: '#fff', fontWeight: 600, borderRadius: 1.5,
                  px: 2.5, py: 0.6, fontSize: '0.8rem', textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                  '&:hover': { bgcolor: '#b91c1c' }
                }}
              >
                Security Audit
              </Button>
            </Box>

            {/* Mobile Menu */}
            <Box sx={{ display: { md: 'none' }, ml: 'auto' }}>
              <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} sx={{ color: '#64748b' }}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>

        {mobileMenuOpen && (
          <Box sx={{ display: { md: 'none' }, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', py: 1 }}>
            <Container>
              {[
                { label: 'Network Scanner', path: '/wifi-hacking' },
                { label: 'Mobile Security', path: '/android-hacking' },
                { label: 'Training Labs', path: '/system-hacking' },
                { label: 'Resources', path: '/download' },
                { label: 'Security Audit', path: '/giveaway' },
              ].map(link => (
                <Box
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                  sx={{ py: 1.2, px: 2, cursor: 'pointer', borderRadius: 1, color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{link.label}</Typography>
                </Box>
              ))}
            </Container>
          </Box>
        )}
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 6, px: { xs: 2, md: 3 } }}>
        {/* ====== HERO SECTION ====== */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a5f 100%)',
            borderRadius: 3, p: { xs: 3, md: 5 }, mb: 4,
            position: 'relative', overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute', top: -100, right: -100, width: 400, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)'
          }} />
          <Box sx={{
            position: 'absolute', bottom: -60, left: -60, width: 250, height: 250,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)'
          }} />
          
          <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Chip label="OPEN BETA" size="small" sx={{ bgcolor: 'rgba(37,99,235,0.2)', color: '#60a5fa', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>v2.4.1 • 847 researchers active</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.6rem' }, lineHeight: 1.2, mb: 1.5 }}>
                Professional Security{' '}
                <Box component="span" sx={{ color: '#60a5fa' }}>Assessment</Box>
                {' '}Platform
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: { xs: '0.9rem', md: '1rem' }, maxWidth: 540, mb: 3, lineHeight: 1.7 }}>
                Enterprise-grade penetration testing tools, vulnerability scanners, and security training resources.
                Built for security professionals, trusted by organizations worldwide.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/wifi-hacking')}
                  sx={{ bgcolor: '#2563eb', color: '#fff', fontWeight: 600, borderRadius: 1.5, px: 3, py: 1.2, textTransform: 'none', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', '&:hover': { bgcolor: '#1d4ed8' } }}
                >
                  Explore Tools
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/download')}
                  sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 1.5, px: 3, py: 1.2, textTransform: 'none', fontSize: '0.95rem', '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.05)' } }}
                >
                  View Resources
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{
                  width: 160, height: 160, mx: 'auto', mb: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(5,150,105,0.1))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Box>
                <Paper sx={{ bgcolor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', borderRadius: 2, p: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography sx={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    SOC 2 Compliant • GDPR Ready
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* ====== STATS BAR ====== */}
        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 2, p: { xs: 2, md: 3 }, mb: 4, border: '1px solid #e2e8f0' }}>
          <Grid container spacing={2} justifyContent="center">
            {stats.map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography sx={{ fontSize: '1.5rem', mb: 0.3 }}>{stat.icon}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1.2rem', md: '1.4rem' } }}>{stat.value}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* ====== MAIN TOOLS SECTION ====== */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 3, fontSize: { xs: '1.3rem', md: '1.6rem' } }}>
          Security Assessment Tools
        </Typography>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {tools.map((tool) => (
            <Grid item xs={12} sm={6} md={3} key={tool.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2, height: '100%', cursor: 'pointer', overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }
                }}
                onClick={() => navigate(tool.path)}
              >
                <Box sx={{ p: 3, pb: 2 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2, mb: 2,
                    bgcolor: `${tool.color}10`, color: tool.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {tool.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem', mb: 1 }}>
                    {tool.title}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.825rem', lineHeight: 1.6, mb: 2 }}>
                    {tool.desc}
                  </Typography>
                </Box>
                <Box sx={{ px: 3, pb: 2.5 }}>
                  <Typography sx={{ color: tool.color, fontWeight: 600, fontSize: '0.85rem' }}>
                    Access →
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ====== FEATURES SECTION ====== */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 3, fontSize: { xs: '1.3rem', md: '1.6rem' } }}>
          Platform Features
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {features.map((feat, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper elevation={0} sx={{
                p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0',
                height: '100%',
                transition: '0.2s',
                '&:hover': { borderColor: '#2563eb', bgcolor: '#f8fafc' }
              }}>
                <Typography sx={{ fontSize: '1.8rem', mb: 1.5 }}>{feat.icon}</Typography>
                <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', mb: 0.8 }}>{feat.title}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.825rem', lineHeight: 1.6 }}>{feat.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ====== CTA BANNER ====== */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            borderRadius: 2, p: { xs: 3, md: 4 }, textAlign: 'center', mb: 4
          }}
        >
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1, fontSize: { xs: '1.3rem', md: '1.6rem' } }}>
            Start Your Security Assessment
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 480, mx: 'auto', fontSize: { xs: '0.9rem', md: '0.95rem' } }}>
            Access professional-grade security tools and resources. No registration required for basic features.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/wifi-hacking')}
              sx={{ bgcolor: '#2563eb', color: '#fff', fontWeight: 600, borderRadius: 1.5, px: 3, textTransform: 'none', fontSize: '0.9rem', '&:hover': { bgcolor: '#1d4ed8' } }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/download')}
              sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 1.5, px: 3, textTransform: 'none', fontSize: '0.9rem', '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              Browse Resources
            </Button>
          </Box>
        </Paper>

        {/* ====== FOOTER ====== */}
        <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid #e2e8f0' }}>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5, fontSize: '0.85rem' }}>Platform</Typography>
              {['Network Scanner', 'Mobile Security', 'Training Labs', 'Resources'].map((item, i) => (
                <Typography key={i} sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.6, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}
                  onClick={() => navigate(['/wifi-hacking', '/android-hacking', '/system-hacking', '/download'][i])}>
                  {item}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5, fontSize: '0.85rem' }}>Learn</Typography>
              {['Documentation', 'API Reference', 'Tutorials', 'Community'].map((item, i) => (
                <Typography key={i} sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.6, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>{item}</Typography>
              ))}
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5, fontSize: '0.85rem' }}>Company</Typography>
              {['About', 'Blog', 'Careers', 'Contact'].map((item, i) => (
                <Typography key={i} sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.6, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>{item}</Typography>
              ))}
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5, fontSize: '0.85rem' }}>Legal</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.6, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>Privacy Policy</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.6, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>Terms of Service</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 0.6, cursor: 'pointer', '&:hover': { color: '#2563eb' } }}>Cookie Policy</Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 3, mb: 2, pt: 3, borderTop: '1px solid #e2e8f0' }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              © 2026 SecLabs. All tools are intended for authorized security testing and educational purposes only.
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Mobile Bottom Nav */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { md: 'none' }, zIndex: 1000 }} elevation={3}>
        <BottomNavigation showLabels sx={{ bgcolor: '#fff', '& .MuiBottomNavigationAction-label': { fontSize: '0.65rem' } }}>
          <BottomNavigationAction label="Home" icon={<SecurityIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Scanner" icon={<span>📶</span>} onClick={() => navigate('/wifi-hacking')} />
          <BottomNavigationAction label="Mobile" icon={<span>📱</span>} onClick={() => navigate('/android-hacking')} />
          <BottomNavigationAction label="Labs" icon={<span>💻</span>} onClick={() => navigate('/system-hacking')} />
          <BottomNavigationAction label="Resources" icon={<span>📄</span>} onClick={() => navigate('/download')} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}