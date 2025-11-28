import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Paper, 
  Chip, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  TablePagination
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/authContext';
import matchmakingService from '../../services/api/matchmakingService';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
const statusMap = {
  open: { label: 'Đang mở', color: 'info' },
  full: { label: 'Đã đủ', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
  expired: { label: 'Đã hết hạn', color: 'warning' },
  completed: { label: 'Đã hoàn thành', color: 'success' }
};

const MatchmakingHistory = () => {
  const { currentUser } = useAuth();
  const [matchmakings, setMatchmakings] = useState([]);
  const [filteredMatchmakings, setFilteredMatchmakings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatchmaking, setSelectedMatchmaking] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    timeRange: 'all', // 'all', 'today', 'week', 'month'
    status: 'all', // 'all', 'open', 'full', 'closed'
    role: 'all', // 'all', 'creator', 'participant'
  });

  const applyFilters = (matches) => {
    let filtered = [...matches];

    // Xác định vai trò của currentUser trong từng trận
    filtered = filtered.map(match => {
      let role = '';
      if (match.userId?._id === currentUser?._id) {
        role = 'creator';
      } else if (Array.isArray(match.joinedPlayers) && match.joinedPlayers.some(p => p?._id === currentUser?._id)) {
        role = 'participant';
      }
      return { ...match, _role: role };
    });

    // Filter theo vai trò
    if (filters.role !== 'all') {
      filtered = filtered.filter(match => match._role === filters.role);
    }

    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(match =>
        match.bookingId?.fieldId?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply time range filter
    const now = dayjs();
    switch (filters.timeRange) {
      case 'today':
        filtered = filtered.filter(match =>
          dayjs.utc(match.bookingId?.startTime).local().isSame(now, 'day')
        );
        break;
      case 'week':
        filtered = filtered.filter(match =>
          dayjs.utc(match.bookingId?.startTime).local().isAfter(now.subtract(7, 'day'))
        );
        break;
      case 'month':
        filtered = filtered.filter(match =>
          dayjs.utc(match.bookingId?.startTime).local().isAfter(now.subtract(30, 'day'))
        );
        break;
      default:
        break;
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(match => match.status === filters.status);
    }

    setFilteredMatchmakings(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(0); // Reset to first page when filter changes
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchMatchmakings = async () => {
      if (!currentUser?._id) return;
      setLoading(true);
      const res = await matchmakingService.getMatchmakingsByUser(currentUser._id);
      const data = res?.data || [];
      setMatchmakings(data);
      applyFilters(data);
      setLoading(false);
    };
    fetchMatchmakings();
  }, [currentUser]);

  useEffect(() => {
    applyFilters(matchmakings);
  }, [filters]);

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#388e3c' }}>
        Lịch sử ghép trận của bạn
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Tìm kiếm theo tên sân"
              variant="outlined"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Thời gian</InputLabel>
              <Select
                value={filters.timeRange}
                label="Thời gian"
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="today">Hôm nay</MenuItem>
                <MenuItem value="week">7 ngày qua</MenuItem>
                <MenuItem value="month">30 ngày qua</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filters.status}
                label="Trạng thái"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="open">Đang mở</MenuItem>
                <MenuItem value="full">Đã đủ</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
                <MenuItem value="expired">Đã hết hạn</MenuItem>
                <MenuItem value="completed">Đã hoàn thành</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={filters.role}
                label="Vai trò"
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="creator">Người tạo</MenuItem>
                <MenuItem value="participant">Người tham gia</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sân</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell>Số người cần thêm</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Chi tiết</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Đang tải...</TableCell>
              </TableRow>
            ) : matchmakings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Bạn chưa có lịch sử ghép trận nào</TableCell>
              </TableRow>
            ) : (
              filteredMatchmakings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(m => (
                <TableRow key={m._id}>
                  <TableCell>{m.bookingId?.fieldId?.name}</TableCell>
                  <TableCell>
                    {m.bookingId?.startTime && m.bookingId?.endTime
                      ? `${dayjs.utc(m.bookingId.startTime).format('HH:mm DD/MM/YYYY')} - ${dayjs.utc(m.bookingId.endTime).format('HH:mm DD/MM/YYYY')}`
                      : ''}
                  </TableCell>
                  <TableCell>{m.requiredPlayers}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[m.status]?.label || m.status}
                      color={statusMap[m.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {m._role === 'creator' ? 'Người tạo' : 'Người tham gia'}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => setSelectedMatchmaking(m)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMatchmakings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
        />
      </Paper>

      {/* Dialog chi tiết ghép trận */}
      <Dialog open={!!selectedMatchmaking} onClose={() => setSelectedMatchmaking(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết ghép trận</DialogTitle>
        <DialogContent dividers>
          {selectedMatchmaking && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Sân: {selectedMatchmaking.bookingId?.fieldId?.name}</Typography>
              <Typography>Thời gian: {selectedMatchmaking.bookingId?.startTime && selectedMatchmaking.bookingId?.endTime
                ? `${dayjs.utc(selectedMatchmaking.bookingId.startTime).format('HH:mm DD/MM/YYYY')} - ${dayjs.utc(selectedMatchmaking.bookingId.endTime).format('HH:mm DD/MM/YYYY')}`
                : ''}</Typography>
              <Typography>Số người cần thêm: {selectedMatchmaking.requiredPlayers}</Typography>
              <Typography>Trạng thái: <Chip label={statusMap[selectedMatchmaking.status]?.label || selectedMatchmaking.status} color={statusMap[selectedMatchmaking.status]?.color || 'default'} size="small" /></Typography>
              <Typography>Người tạo: {selectedMatchmaking.userId?.fname} {selectedMatchmaking.userId?.lname}</Typography>
              {/* <Typography>Email người tạo: {selectedMatchmaking.userId?.email || 'Không có'}</Typography> */}
              <Typography>SĐT người tạo: {selectedMatchmaking.userId?.phoneNumber || 'Không có'}</Typography>
              <Typography>Người đại diện ghép: {selectedMatchmaking.representativeId ? `${selectedMatchmaking.representativeId?.fname} ${selectedMatchmaking.representativeId?.lname}` : 'Chưa có'}</Typography>
              {selectedMatchmaking.joinedPlayers && selectedMatchmaking.joinedPlayers.length > 0 && (
                <Typography>
                  Người đã tham gia: {selectedMatchmaking.joinedPlayers.map(p => p?.fname ? `${p.fname} ${p.lname}` : p).join(', ')}
                </Typography>
              )}
              <Typography>Ngày tạo: {dayjs.utc(selectedMatchmaking.createdAt).format('HH:mm DD/MM/YYYY')}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMatchmaking(null)} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MatchmakingHistory;