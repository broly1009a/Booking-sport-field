import React, { useEffect, useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { 
  Box, 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Button, 
  Paper, 
  Link,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Pagination,
  TablePagination
} from '@mui/material';
import { toast } from 'react-toastify';
import matchmakingService from '../../services/api/matchmakingService';
import { useAuth } from '../../contexts/authContext';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const MatchmakingList = () => {
 
  const [matchmakings, setMatchmakings] = useState([]);
  const [filteredMatchmakings, setFilteredMatchmakings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    timeFilter: 'all', // 'all', 'today', 'tomorrow', 'week'
    playerCount: 'all', // 'all', '1', '2', '3', '4'
  });

  const fetchOpenMatchmakings = async () => {
    setLoading(true);
    const res = await matchmakingService.getOpenMatchmakings();
    if (res && res.data) {
      // Lọc ra các trận chưa diễn ra
      const activeMatches = res.data.filter(match => 
        dayjs(match.bookingId?.startTime).isAfter(dayjs())
      );
      setMatchmakings(activeMatches);
      applyFilters(activeMatches);
    } else {
      setMatchmakings([]);
      setFilteredMatchmakings([]);
    }
    setLoading(false);
  };

  const applyFilters = (matches) => {
    let filtered = [...matches];

    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(match =>
        match.bookingId?.fieldName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        `${match.userId?.fname} ${match.userId?.lname}`.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply time filter
    switch (filters.timeFilter) {
      case 'today':
        filtered = filtered.filter(match =>
          dayjs(match.bookingId?.startTime).isSame(dayjs(), 'day')
        );
        break;
      case 'tomorrow':
        filtered = filtered.filter(match =>
          dayjs(match.bookingId?.startTime).isSame(dayjs().add(1, 'day'), 'day')
        );
        break;
      case 'week':
        filtered = filtered.filter(match =>
          dayjs(match.bookingId?.startTime).isBefore(dayjs().add(7, 'day'))
        );
        break;
      default:
        break;
    }

    // Apply player count filter
    if (filters.playerCount !== 'all') {
      filtered = filtered.filter(match =>
        match.requiredPlayers === parseInt(filters.playerCount)
      );
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
    fetchOpenMatchmakings();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    applyFilters(matchmakings);
    // eslint-disable-next-line
  }, [filters]);

  const handleJoin = async (id) => {
    if (!currentUser?._id) {
      toast.error('Bạn cần đăng nhập để ghép trận');
      return;
    }
    const confirmed = window.confirm('Bạn chắc chắn muốn ghép vào phòng này?');
    if (!confirmed) return;

    const res = await matchmakingService.joinMatchmaking(id, currentUser._id);
    if (res && res.data) {
      toast.success('Ghép trận thành công!');
      fetchOpenMatchmakings();
    } else {
      toast.error(res?.message || 'Ghép trận thất bại!');
    }
  };

  const handleFieldClick = (fieldId) => {
    if (fieldId) {
      navigate(`/yard-detail/${fieldId}`);
    }
  };
   // Gọi API đóng các phòng ghép quá hạn
    const handleCloseExpired = async () => {
      setLoading(true);
      try {
        const res = await matchmakingService.closeExpiredOpenMatchmakings();
        if (res && res.success) {
          toast.success(`Đã đóng ${res.closedCount} phòng ghép quá hạn!`);
          fetchOpenMatchmakings();
        } else {
          toast.error(res?.message || 'Đóng phòng ghép quá hạn thất bại!');
        }
      } catch (err) {
        toast.error('Lỗi khi đóng phòng ghép quá hạn!');
      }
      setLoading(false);
    };
  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ color: '#388e3c' }}>
          Danh sách phòng ghép trận đang mở
        </Typography>
        <Button variant="outlined" color="secondary" onClick={handleCloseExpired} disabled={loading}>
          <RefreshIcon />
        </Button>
      </Box>
   

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Thời gian</InputLabel>
              <Select
                value={filters.timeFilter}
                label="Thời gian"
                onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="today">Hôm nay</MenuItem>
                <MenuItem value="tomorrow">Ngày mai</MenuItem>
                <MenuItem value="week">Tuần này</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Số người cần</InputLabel>
              <Select
                value={filters.playerCount}
                label="Số người cần"
                onChange={(e) => handleFilterChange('playerCount', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="1">1 người</MenuItem>
                <MenuItem value="2">2 người</MenuItem>
                <MenuItem value="3">3 người</MenuItem>
                <MenuItem value="4">4 người</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người tạo</TableCell>
              <TableCell>Sân</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell>Số người cần thêm</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Đang tải...</TableCell>
              </TableRow>
            ) : matchmakings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Không có phòng ghép nào đang mở</TableCell>
              </TableRow>
            ) : (
              filteredMatchmakings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(m => (
                <TableRow key={m._id}>
                  <TableCell>{m.userId?.fname} {m.userId?.lname}</TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      underline="hover"
                      color="primary"
                      onClick={() => handleFieldClick(m.bookingId?.fieldId?._id || m.bookingId?.fieldId)}
                      sx={{ cursor: 'pointer', fontWeight: 600 }}
                    >
                      {m.bookingId?.fieldName || m.bookingId?.fieldId?.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {m.bookingId?.startTime && m.bookingId?.endTime
                      ? `${new Date(m.bookingId.startTime).toLocaleString()} - ${new Date(m.bookingId.endTime).toLocaleString()}`
                      : ''}
                  </TableCell>
                  <TableCell>{m.requiredPlayers}</TableCell>
                  <TableCell>
                    {dayjs(m.bookingId?.startTime).isBefore(dayjs()) ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Trận đã diễn ra
                      </Typography>
                    ) : currentUser?._id !== m.userId?._id && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleJoin(m._id)}
                        disabled={!!m.representativeId}
                      >
                        Ghép trận
                      </Button>
                    )}
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
    </Box>
  );
};

export default MatchmakingList;