import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Paper, Link } from '@mui/material';
import { toast } from 'react-toastify';
import matchmakingService from '../../services/api/matchmakingService';
import { useAuth } from '../../contexts/authContext';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const MatchmakingList = () => {
  const [matchmakings, setMatchmakings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchOpenMatchmakings = async () => {
    setLoading(true);
    const res = await matchmakingService.getOpenMatchmakings();
    if (res && res.data) {
      setMatchmakings(res.data);
    } else {
      setMatchmakings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOpenMatchmakings();
    // eslint-disable-next-line
  }, []);

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

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#388e3c' }}>
        Danh sách phòng ghép trận đang mở
      </Typography>
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
              matchmakings.map(m => (
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
  {currentUser?._id !== m.userId?._id && (
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
      </Paper>
    </Box>
  );
};

export default MatchmakingList;