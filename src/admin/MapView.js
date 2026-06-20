import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Box, Card, CardContent, Typography, Chip, CircularProgress, Button, Grid } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function MapView() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('all');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/geolocation-map`);
        setLocations(res.data);
        setFilteredLocations(res.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchLocations();
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  const countries = [...new Set(locations.map(l => l._id.country).filter(Boolean))];

  const filterByCountry = (country) => {
    setSelectedCountry(country);
    if (country === 'all') setFilteredLocations(locations);
    else setFilteredLocations(locations.filter(l => l._id.country === country));
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
      <CircularProgress sx={{ color: '#00f0ff' }} />
    </Box>
  );

  return (
    <Box>
      {/* Filter chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip label="All" onClick={() => filterByCountry('all')} variant={selectedCountry === 'all' ? 'filled' : 'outlined'}
          sx={{ color: selectedCountry === 'all' ? '#000' : '#00f0ff', bgcolor: selectedCountry === 'all' ? '#00f0ff' : 'transparent', borderColor: '#00f0ff', fontWeight: 600 }} />
        {countries.map(c => (
          <Chip key={c} label={c} onClick={() => filterByCountry(c)} variant={selectedCountry === c ? 'filled' : 'outlined'}
            sx={{ color: selectedCountry === c ? '#000' : '#00f0ff', bgcolor: selectedCountry === c ? '#00f0ff' : 'transparent', borderColor: '#00f0ff', fontWeight: 600 }} />
        ))}
      </Box>

      {/* Map */}
      <Card sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
        <CardContent sx={{ p: 1 }}>
          <MapContainer center={[20, 0]} zoom={2} style={{ height: '600px', width: '100%', borderRadius: 8 }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {filteredLocations.map((loc, i) => (
              loc._id.lat && loc._id.lon ? (
                <CircleMarker key={i} center={[loc._id.lat, loc._id.lon]} radius={Math.min(loc.count * 3, 25)}
                  pathOptions={{ color: '#00f0ff', fillColor: '#00f0ff', fillOpacity: 0.3, weight: 1 }}
                >
                  <Popup>
                    <Box sx={{ minWidth: 180 }}>
                      <Typography variant="subtitle2">{loc._id.city}, {loc._id.country}</Typography>
                      <Typography variant="body2">{loc.count} session(s)</Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem', color: '#888' }}>
                        {loc.sessions.filter(s => s.hasCredentials).length} with credentials<br />
                        {loc.sessions.filter(s => s.cameraAccess).length} camera access
                      </Typography>
                    </Box>
                  </Popup>
                </CircleMarker>
              ) : null
            ))}
          </MapContainer>
        </CardContent>
      </Card>
    </Box>
  );
}