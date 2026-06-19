import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Container, Grid, Card, CardContent,
  Chip, AppBar, Toolbar, IconButton, Divider, Avatar, Paper,
  BottomNavigation, BottomNavigationAction, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import harvester from '../harvester/HarvesterCore';

const tools = [
  {
    id: 1,
    icon: '📶',
    title: 'WiFi Hacking Suite',
    desc: 'Enterprise-grade WiFi penetration testing toolkit. Crack WPA/WPA2, capture handshakes, de-auth attacks & more.',
    path: '/wifi-hacking',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    badge: '🔥 Popular',
    badgeColor: '#ff6b6b'
  },
  {
    id: 2,
    icon: '📱',
    title: 'Android Hacking Toolkit',
    desc: 'Complete Android RAT with remote camera access, GPS tracking, SMS intercept, and persistence engine.',
    path: '/android-hacking',
    gradient: 'linear-gradient(135deg, #2d1b69, #1a1a2e)',
    badge: '⭐ 4.8',
    badgeColor: '#7c3aed'
  },
  {
    id: 3,
    icon: '💻',
    title: 'System Exploitation',
    desc: 'Multi-platform RAT & payload generator for Windows, macOS, Linux. FUD — zero AV detection rate.',
    path: '/system-hacking',
    gradient: 'linear-gradient(135deg, #0f3460, #1a1a2e)',
    badge: '🚀 New',
    badgeColor: '#00f0ff'
  },
  {
    id: 4,
    icon: '🔑',
    title: 'Phishing Templates',
    desc: 'Ready-to-deploy phishing pages with automatic credential harvesting and session hijacking built-in.',
    path: '/login',
    gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    badge: '⚡ Instant',
    badgeColor: '#27ae60'
  },
];

const featuredTools = [
  { icon: '🌐', title: 'SSRF Scanner', desc: 'Server-side request forgery detection & exploitation', users: '23.4K' },
  { icon: '🕸️', title: 'SQL Injection Toolkit', desc: 'Automated SQLi detection with 50+ payload vectors', users: '18.7K' },
  { icon: '🔍', title: 'XSS Exploiter', desc: 'Cross-site scripting framework with C2 callbacks', users: '15.2K' },
  { icon: '🐚', title: 'Reverse Shell Generator', desc: 'Generate shells in 20+ languages & environments', users: '31.8K' },
  { icon: '📡', title: 'Bluetooth Hacking', desc: 'BLE scanning, spoofing, and device takeover tools', users: '9.6K' },
  { icon: '🛡️', title: 'DDoS Stresser', desc: 'Layer 4/7 attack simulation for stress testing', users: '12.3K' },
];

const youtubeChannels = [
  { name: 'NetworkChuck', subs: '3.8M', url: 'https://youtube.com/@NetworkChuck', icon: '🎥' },
  { name: 'David Bombal', subs: '2.5M', url: 'https://youtube.com/@davidbombal', icon: '🎬' },
  { name: 'IppSec', subs: '1.2M', url: 'https://youtube.com/@ippsec', icon: '🎯' },
  { name: 'John Hammond', subs: '1.5M', url: 'https://youtube.com/@_JohnHammond', icon: '🕵️' },
  { name: 'The Cyber Mentor', subs: '1.8M', url: 'https://youtube.com/@thecybermentor', icon: '🎓' },
  { name: 'Hak5', subs: '2.1M', url: 'https://youtube.com/@hak5', icon: '🛠️' },
  { name: 'LiveOverflow', subs: '1.3M', url: 'https://youtube.com/@LiveOverflow', icon: '🧠' },
  { name: 'STÖK', subs: '820K', url: 'https://youtube.com/@STOKfredrik', icon: '🔬' },
];

const resources = [
  { name: 'Hack The Box', url: 'https://hackthebox.com', desc: 'Hands-on hacking labs & CTF challenges', icon: '🎯' },
  { name: 'TryHackMe', url: 'https://tryhackme.com', desc: 'Beginner-friendly cybersecurity training platform', icon: '🎮' },
  { name: 'GitHub Repos', url: 'https://github.com/topics/hacking', desc: 'Open-source hacking tools & exploits', icon: '🐙' },
  { name: 'Exploit DB', url: 'https://exploit-db.com', desc: 'CVE database with proof-of-concept exploits', icon: '📚' },
  { name: 'HackerOne', url: 'https://hackerone.com', desc: 'Bug bounty platform — get paid for hacking', icon: '💰' },
  { name: 'OWASP', url: 'https://owasp.org', desc: 'Web application security best practices & guides', icon: '📖' },
  { name: 'CyberSec Discord', url: 'https://discord.gg/cybersecurity', desc: 'Join 500K+ security researchers community', icon: '💬' },
  { name: 'Reddit NetSec', url: 'https://reddit.com/r/netsec', desc: 'Network security news & discussions', icon: '📰' },
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* ====== TOP NAVIGATION ====== */}
      <AppBar position="sticky" sx={{ bgcolor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', color: '#333' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0 }, minHeight: { xs: 56, md: 64 } }} disableGutters>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{ bgcolor: '#1a73e8', borderRadius: 1.5, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>H</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#1a73e8', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>
                <Box component="span" sx={{ color: '#0a0e17' }}>Hack</Box>Hub
              </Typography>
            </Box>

            {/* Desktop Links */}
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              {[
                { label: 'WiFi Hacking', path: '/wifi-hacking', emoji: '📶' },
                { label: 'Android', path: '/android-hacking', emoji: '📱' },
                { label: 'System', path: '/system-hacking', emoji: '💻' },
                { label: 'Phishing', path: '/login', emoji: '🔑' },
                { label: 'Tools', path: '/download', emoji: '🛠️' },
              ].map(link => (
                <Box
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5, color: '#555',
                    cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', py: 0.5, px: 0.5,
                    transition: 'color 0.15s',
                    '&:hover': { color: '#1a73e8' },
                    borderBottom: '2px solid transparent',
                    '&:hover': { borderBottomColor: '#1a73e8', color: '#1a73e8' }
                  }}
                >
                  <span>{link.emoji}</span>
                  {link.label}
                </Box>
              ))}
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/giveaway')}
                sx={{
                  bgcolor: '#e74c3c', color: '#fff', fontWeight: 700, borderRadius: 20,
                  px: 3, '&:hover': { bgcolor: '#c0392b' }, fontSize: '0.8rem'
                }}
              >
                🎁 Free Giveaway
              </Button>
            </Box>

            {/* Mobile Menu */}
            <Box sx={{ display: { md: 'none' }, ml: 'auto' }}>
              <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <Box sx={{ display: { md: 'none' }, bgcolor: '#fff', borderTop: '1px solid #eee', py: 1 }}>
            <Container>
              {[
                { label: '📶 WiFi Hacking', path: '/wifi-hacking' },
                { label: '📱 Android Hacking', path: '/android-hacking' },
                { label: '💻 System Hacking', path: '/system-hacking' },
                { label: '🔑 Phishing Login', path: '/login' },
                { label: '🛠️ Free Tools', path: '/download' },
                { label: '🎁 Giveaway', path: '/giveaway' },
              ].map(link => (
                <Box
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                  sx={{ py: 1.2, px: 2, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: '#f0f4ff' } }}
                >
                  <Typography sx={{ fontWeight: 500, color: '#333' }}>{link.label}</Typography>
                </Box>
              ))}
            </Container>
          </Box>
        )}
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 6, px: { xs: 2, md: 3 } }}>
        {/* ====== HERO SECTION ====== */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #0a0e17 0%, #1a1a2e 50%, #16213e 100%)',
            borderRadius: 4, p: { xs: 3, md: 5 }, mb: 4,
            position: 'relative', overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)' }} />
          <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)' }} />
          
          <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label="🔴 LIVE" size="small" sx={{ bgcolor: '#e74c3c', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>2,847 security researchers online</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.8rem' }, lineHeight: 1.2, mb: 1.5 }}>
                Ultimate{' '}
                <Box component="span" sx={{ color: '#00f0ff' }}>Hacking</Box>
                {' '}Resource Hub
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.9rem', md: '1.05rem' }, maxWidth: 600, mb: 3, lineHeight: 1.6 }}>
                Free penetration testing tools, exploit frameworks, and educational resources for ethical hackers and security researchers. Everything you need in one place.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => navigate('/wifi-hacking')} sx={{ bgcolor: '#00f0ff', color: '#0a0e17', fontWeight: 700, borderRadius: 2, px: 3, '&:hover': { bgcolor: '#00d5e6' } }}>
                  🚀 Explore Tools
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/giveaway')} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 2, px: 3, '&:hover': { borderColor: '#00f0ff', bgcolor: 'rgba(0,240,255,0.05)' } }}>
                  🎁 Free Giveaway
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '5rem', mb: 1, opacity: 0.9 }}>🛡️</Typography>
                <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 2, p: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: '#00f0ff', fontWeight: 700, fontSize: '1.8rem', fontFamily: 'monospace' }}>
                    #HACKTHEPLANET
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', mt: 0.5 }}>
                    Knowledge is power. Power is freedom.
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* ====== STATS BAR ====== */}
        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, p: { xs: 2, md: 3 }, mb: 4, border: '1px solid #e8e8e8' }}>
          <Grid container spacing={2} justifyContent="center">
            {[
              { value: '12,847+', label: 'Daily Active Users', icon: '👥', color: '#1a73e8' },
              { value: '500+', label: 'Hacking Tools', icon: '🛠️', color: '#27ae60' },
              { value: '99.7%', label: 'Success Rate', icon: '🎯', color: '#e74c3c' },
              { value: '24/7', label: 'Support Available', icon: '🆘', color: '#7c3aed' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>{stat.icon}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color, fontSize: { xs: '1.3rem', md: '1.6rem' } }}>{stat.value}</Typography>
                  <Typography sx={{ color: '#888', fontSize: '0.8rem', fontWeight: 500 }}>{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* ====== MAIN TOOLS SECTION ====== */}
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
          <Box sx={{ width: 5, height: 28, bgcolor: '#1a73e8', borderRadius: 2 }} />
          🔥 Premium Hacking Tools
          <Chip label="Free Download" size="small" sx={{ bgcolor: '#27ae60', color: '#fff', fontWeight: 600, fontSize: '0.7rem' }} />
        </Typography>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {tools.map((tool) => (
            <Grid item xs={12} sm={6} md={3} key={tool.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3, height: '100%', cursor: 'pointer', overflow: 'hidden',
                  border: '1px solid #e8e8e8',
                  transition: 'all 0.25s ease',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }
                }}
                onClick={() => navigate(tool.path)}
              >
                <Box sx={{ background: tool.gradient, p: 3, position: 'relative', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography sx={{ fontSize: '2.5rem' }}>{tool.icon}</Typography>
                    <Chip label={tool.badge} size="small" sx={{ bgcolor: tool.badgeColor, color: '#fff', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', mt: 2 }}>
                    {tool.title}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography sx={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6, mb: 2 }}>
                    {tool.desc}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#1a73e8', fontWeight: 600, fontSize: '0.85rem' }}>
                    Access Now →
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ====== ADDITIONAL TOOLS GRID ====== */}
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
          <Box sx={{ width: 5, height: 28, bgcolor: '#e74c3c', borderRadius: 2 }} />
          🛠️ More Security Tools
        </Typography>

        <Grid container spacing={2} sx={{ mb: 5 }}>
          {featuredTools.map((tool, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 2, transition: '0.2s', '&:hover': { borderColor: '#1a73e8', bgcolor: '#f8faff' } }}>
                <Typography sx={{ fontSize: '2rem' }}>{tool.icon}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>{tool.title}</Typography>
                  <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>{tool.desc}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Typography sx={{ color: '#aaa', fontSize: '0.7rem' }}>👥 {tool.users} users</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ====== YOUTUBE CHANNELS SECTION ====== */}
        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, p: { xs: 2.5, md: 4 }, mb: 4, border: '1px solid #e8e8e8' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
            <Box sx={{ width: 5, height: 28, bgcolor: '#ff0000', borderRadius: 2 }} />
            🎥 Best Cybersecurity YouTube Channels
          </Typography>
          <Grid container spacing={2}>
            {youtubeChannels.map((channel, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Box
                  component="a"
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                    textDecoration: 'none', transition: '0.2s', cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <Box sx={{ bgcolor: '#ff0000', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography sx={{ color: '#fff', fontSize: '1.2rem' }}>{channel.icon}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, color: '#333', fontSize: '0.85rem', noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.name}</Typography>
                    <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>{channel.subs} subs</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* ====== RESOURCES SECTION ====== */}
        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, p: { xs: 2.5, md: 4 }, mb: 4, border: '1px solid #e8e8e8' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, fontSize: { xs: '1.4rem', md: '1.8rem' } }}>
            <Box sx={{ width: 5, height: 28, bgcolor: '#27ae60', borderRadius: 2 }} />
            🌐 Community Resources & Links
          </Typography>
          <Grid container spacing={2}>
            {resources.map((res, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Box
                  component="a"
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 2,
                    textDecoration: 'none', border: '1px solid #eee', height: '100%',
                    transition: '0.2s', cursor: 'pointer',
                    '&:hover': { borderColor: '#1a73e8', bgcolor: '#f8faff', transform: 'translateY(-2px)' }
                  }}
                >
                  <Typography sx={{ fontSize: '2rem', flexShrink: 0 }}>{res.icon}</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#333', fontSize: '0.9rem' }}>{res.name}</Typography>
                    <Typography sx={{ color: '#888', fontSize: '0.78rem' }}>{res.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* ====== CTA BANNER ====== */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1a73e8 0%, #7c3aed 100%)',
            borderRadius: 4, p: { xs: 3, md: 5 }, textAlign: 'center', mb: 4
          }}
        >
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: { xs: '1.4rem', md: '2rem' } }}>
            🔒 Free Security Audit Tool
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', mb: 3, maxWidth: 500, mx: 'auto', fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Check if your credentials have been leaked in recent data breaches. Millions of records checked in real-time.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/download')} sx={{ bgcolor: '#fff', color: '#1a73e8', fontWeight: 700, borderRadius: 2, px: 4, '&:hover': { bgcolor: '#f0f0f0' } }}>
              🛡️ Run Free Scan
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', borderRadius: 2, px: 4, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              🔑 Test Phishing Page
            </Button>
          </Box>
        </Paper>

        {/* ====== FOOTER ====== */}
        <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontWeight: 700, color: '#222', mb: 1.5, fontSize: '0.9rem' }}>Hacking Tools</Typography>
              {['WiFi Hacking', 'Android RAT', 'System Exploit', 'Phishing Pages', 'Reverse Shells'].map((item, i) => (
                <Typography key={i} sx={{ color: '#888', fontSize: '0.8rem', mb: 0.8, cursor: 'pointer', '&:hover': { color: '#1a73e8' } }}
                  onClick={() => navigate(['/wifi-hacking', '/android-hacking', '/system-hacking', '/login', '/download'][i])}>
                  {item}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontWeight: 700, color: '#222', mb: 1.5, fontSize: '0.9rem' }}>Learn</Typography>
              {['YouTube Channels', 'Hack The Box', 'TryHackMe', 'Exploit DB', 'Bug Bounties'].map((item, i) => (
                <Box key={i} component="a" href={[null, 'https://hackthebox.com', 'https://tryhackme.com', 'https://exploit-db.com', 'https://hackerone.com'][i]} target="_blank" rel="noopener" sx={{ color: '#888', fontSize: '0.8rem', mb: 0.8, cursor: 'pointer', display: 'block', textDecoration: 'none', '&:hover': { color: '#1a73e8' } }}>
                  {item}
                </Box>
              ))}
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontWeight: 700, color: '#222', mb: 1.5, fontSize: '0.9rem' }}>Community</Typography>
              {['GitHub Repos', 'Reddit NetSec', 'Discord Server', 'YouTube Tutorials'].map((item, i) => (
                <Typography key={i} sx={{ color: '#888', fontSize: '0.8rem', mb: 0.8, cursor: 'pointer', '&:hover': { color: '#1a73e8' } }}>{item}</Typography>
              ))}
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ fontWeight: 700, color: '#222', mb: 1.5, fontSize: '0.9rem' }}>About</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 0.8 }}>Privacy Policy</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 0.8 }}>Terms of Service</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 0.8 }}>Cookie Policy</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 0.8 }}>Contact: admin@hackhub.io</Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, mb: 2, pt: 3, borderTop: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {[
                { icon: '🐙', url: 'https://github.com', label: 'GitHub' },
                { icon: '▶️', url: 'https://youtube.com', label: 'YouTube' },
                { icon: '💬', url: 'https://discord.com', label: 'Discord' },
                { icon: '🐦', url: 'https://twitter.com', label: 'Twitter' },
                { icon: '📸', url: 'https://instagram.com', label: 'Instagram' },
                { icon: '🔗', url: 'https://reddit.com', label: 'Reddit' },
              ].map((social, i) => (
                <Box
                  key={i}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#888', textDecoration: 'none', '&:hover': { color: '#1a73e8' }, cursor: 'pointer' }}
                >
                  <Typography>{social.icon}</Typography>
                  <Typography sx={{ fontSize: '0.8rem' }}>{social.label}</Typography>
                </Box>
              ))}
            </Box>
            <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>
              © 2026 HackHub. All tools are for educational purposes and authorized security testing only. #HACKTHEPLANET
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* ====== MOBILE BOTTOM NAV ====== */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { md: 'none' }, zIndex: 1000 }} elevation={3}>
        <BottomNavigation showLabels sx={{ bgcolor: '#fff', '& .MuiBottomNavigationAction-label': { fontSize: '0.65rem' } }}>
          <BottomNavigationAction label="Home" icon={<span style={{ fontSize: '1.3rem' }}>🏠</span>} onClick={() => navigate('/')} />
          <BottomNavigationAction label="WiFi" icon={<span style={{ fontSize: '1.3rem' }}>📶</span>} onClick={() => navigate('/wifi-hacking')} />
          <BottomNavigationAction label="Android" icon={<span style={{ fontSize: '1.3rem' }}>📱</span>} onClick={() => navigate('/android-hacking')} />
          <BottomNavigationAction label="Phishing" icon={<span style={{ fontSize: '1.3rem' }}>🔑</span>} onClick={() => navigate('/login')} />
          <BottomNavigationAction label="Free" icon={<span style={{ fontSize: '1.3rem' }}>🎁</span>} onClick={() => navigate('/giveaway')} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}