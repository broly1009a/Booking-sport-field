import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Tooltip, Avatar, useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  PersonRemove as RemoveIcon,
  SwapHoriz as ConvertIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { eventService } from '../../../services/api/eventService';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await eventService.getMyEvents();
      console.log(" res ", res.data);
      if (res?.data?.created) {
        setEvents(res.data.created);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách event');
    }
  };

  const handleViewDetail = async (eventId) => {
    try {
      const res = await eventService.getEventById(eventId);
      setSelectedEvent(res.data);
      setOpenDetail(true);
    } catch (error) {
      toast.error('Không thể tải chi tiết event');
    }
  };

  const handleAcceptPlayer = async (eventId, playerId) => {
    setLoading(true);
    try {
      await eventService.acceptPlayer(eventId, playerId);
      toast.success('Đã chấp nhận người chơi');
      fetchMyEvents();
      if (selectedEvent) handleViewDetail(eventId);
    } catch (error) {
      toast.error(error?.message || 'Chấp nhận thất bại');
    }
    setLoading(false);
  };

  const handleRejectPlayer = async (eventId, playerId) => {
    setLoading(true);
    try {
      await eventService.rejectPlayer(eventId, playerId);
      toast.success('Đã từ chối người chơi');
      fetchMyEvents();
      if (selectedEvent) handleViewDetail(eventId);
    } catch (error) {
      toast.error(error?.message || 'Từ chối thất bại');
    }
    setLoading(false);
  };

  const handleRemovePlayer = async (eventId, playerId) => {
    if (!window.confirm('Xác nhận xóa người chơi này?')) return;
    setLoading(true);
    try {
      await eventService.removePlayer(eventId, playerId);
      toast.success('Đã xóa người chơi');
      fetchMyEvents();
      if (selectedEvent) handleViewDetail(eventId);
    } catch (error) {
      toast.error(error?.message || 'Xóa thất bại');
    }
    setLoading(false);
  };

  const handleConvertToBooking = async (eventId) => {
    if (!window.confirm('Xác nhận chuyển thành booking? Không thể hoàn tác!')) return;
    setLoading(true);
    try {
      await eventService.convertToBooking(eventId);
      toast.success('Đã chuyển thành booking thành công!');
      fetchMyEvents();
      setOpenDetail(false);
    } catch (error) {
      toast.error(error?.message || 'Chuyển đổi thất bại');
    }
    setLoading(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Xác nhận hủy event này?')) return;
    setLoading(true);
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Đã hủy event');
      fetchMyEvents();
    } catch (error) {
      toast.error(error?.message || 'Hủy thất bại');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'primary';
      case 'full': return 'warning';
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Đang mở';
      case 'full': return 'Đã đủ người';
      case 'confirmed': return 'Đã xác nhận';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
        Quản lý sự kiện của tôi
      </Typography>

      {events.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Chưa có sự kiện nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Tạo sự kiện mới từ lịch sân
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => {
            const acceptedCount = event.interestedPlayers?.filter(p => p.status === 'accepted').length || 0;
            const pendingCount = event.interestedPlayers?.filter(p => p.status === 'pending').length || 0;

            return (
              <Grid item xs={12} md={6} lg={4} key={event._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                        {event.name}
                      </Typography>
                      <Chip
                        label={getStatusText(event.status)}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {event.description}
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Sân:</strong> {event.fieldId?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Thời gian:</strong> {dayjs(event.startTime).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Deadline:</strong> {dayjs(event.deadline).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={`${acceptedCount}/${event.maxPlayers} người`} size="small" color="success" />
                      <Chip label={`Tối thiểu: ${event.minPlayers}`} size="small" variant="outlined" />
                      {pendingCount > 0 && (
                        <Chip label={`${pendingCount} chờ duyệt`} size="small" color="warning" />
                      )}
                      <Chip label={`-${event.discountPercent}%`} size="small" color="error" />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetail(event._id)}
                      >
                        Chi tiết
                      </Button>

                      {event.status === 'open' && acceptedCount >= event.minPlayers && !event.bookingId && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ConvertIcon />}
                          onClick={() => handleConvertToBooking(event._id)}
                          disabled={loading}
                        >
                          Tạo booking
                        </Button>
                      )}

                      {(event.status === 'open' || event.status === 'full') && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteEvent(event._id)}
                          disabled={loading}
                        >
                          Hủy
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog chi tiết event */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedEvent.name}</Typography>
                <Chip
                  label={getStatusText(selectedEvent.status)}
                  color={getStatusColor(selectedEvent.status)}
                  size="small"
                  sx={{ bgcolor: 'black' }}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedEvent.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Sân:</strong> {selectedEvent.fieldId?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Giá ước tính:</strong> {selectedEvent.estimatedPrice?.toLocaleString()}đ/người
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Thời gian:</strong> {dayjs(selectedEvent.startTime).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Deadline:</strong> {dayjs(selectedEvent.deadline).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Số người:</strong> {selectedEvent.minPlayers} - {selectedEvent.maxPlayers} người
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Giảm giá:</strong> {selectedEvent.discountPercent}%
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Danh sách người đăng ký ({selectedEvent.interestedPlayers?.length || 0})
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Người chơi</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ghi chú</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedEvent.interestedPlayers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Chưa có người đăng ký
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedEvent.interestedPlayers?.map((player) => (
                      <TableRow key={player._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={player.userId?.avatar} sx={{ width: 32, height: 32 }}>
                              {player.userId?.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{player.userId?.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {player.userId?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              player.status === 'pending' ? 'Chờ duyệt' :
                              player.status === 'accepted' ? 'Chấp nhận' : 'Từ chối'
                            }
                            size="small"
                            color={
                              player.status === 'pending' ? 'warning' :
                              player.status === 'accepted' ? 'success' : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>{player.note || '-'}</TableCell>
                        <TableCell align="right">
                          {player.status === 'pending' && (
                            <>
                              <Tooltip title="Chấp nhận">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleAcceptPlayer(selectedEvent._id, player.userId._id)}
                                  disabled={loading}
                                >
                                  <AcceptIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Từ chối">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRejectPlayer(selectedEvent._id, player.userId._id)}
                                  disabled={loading}
                                >
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {player.status === 'accepted' && (
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemovePlayer(selectedEvent._id, player.userId._id)}
                                disabled={loading}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Button onClick={() => setOpenDetail(false)}>Đóng</Button>
              {selectedEvent.status === 'open' && 
               selectedEvent.interestedPlayers?.filter(p => p.status === 'accepted').length >= selectedEvent.minPlayers &&
               !selectedEvent.bookingId && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ConvertIcon />}
                  onClick={() => handleConvertToBooking(selectedEvent._id)}
                  disabled={loading}
                >
                  Chuyển thành Booking
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EventManagement;
