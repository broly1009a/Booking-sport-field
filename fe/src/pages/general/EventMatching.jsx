import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  LocalOffer as DiscountIcon,
  Info as InfoIcon,
  PersonAdd as JoinIcon,
  ExitToApp as LeaveIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { eventService } from '../../services/api/eventService';
import { walletService } from '../../services/api/walletService';
import { useAuth } from '../../contexts/authContext';

const EventMatching = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [joinNote, setJoinNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [userSchedule, setUserSchedule] = useState([]);
  const { currentUser } = useAuth();

  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    playerLevel: 'all',
    playStyle: 'all',
    minSlots: '',
    startDate: '',
    endDate: ''
  });

  const fetchEvents = async () => {
    try {
      const res = await eventService.getAvailableEvents();
      if (res?.data) {
        setEvents(res.data);
        applyFilters(res.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách sự kiện');
    }
  };

  const fetchUserSchedule = async () => {
    if (!currentUser?._id) return;
    try {
      const res = await eventService.getUserSchedule();
      if (res?.data) {
        setUserSchedule(res.data);
      }
    } catch (error) {
      console.error('Không thể tải lịch trình:', error);
    }
  };

  const applyFilters = (eventList) => {
    let filtered = [...eventList];

    if (filters.searchTerm) {
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        event.fieldId?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.playerLevel && filters.playerLevel !== 'all') {
      filtered = filtered.filter(event =>
        event.playerLevel === filters.playerLevel || event.playerLevel === 'any'
      );
    }

    if (filters.playStyle && filters.playStyle !== 'all') {
      filtered = filtered.filter(event =>
        event.playStyle === filters.playStyle || event.playStyle === 'any'
      );
    }

    if (filters.minSlots) {
      filtered = filtered.filter(event =>
        event.availableSlots >= parseInt(filters.minSlots)
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(event =>
        dayjs(event.startTime).isAfter(dayjs(filters.startDate))
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(event =>
        dayjs(event.startTime).isBefore(dayjs(filters.endDate))
      );
    }

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  useEffect(() => {
    fetchEvents();
    fetchUserSchedule();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    applyFilters(events);
    // eslint-disable-next-line
  }, [filters, events]);

  const handleViewDetail = async (eventId) => {
    try {
      const res = await eventService.getEventById(eventId);
      if (res?.data) {
        setSelectedEvent(res.data);
        setOpenDetail(true);
      }
    } catch (error) {
      toast.error('Không thể tải chi tiết sự kiện');
    }
  };

  const handleOpenJoinDialog = (event) => {
    setSelectedEvent(event);
    setJoinNote('');
    setOpenJoinDialog(true);
  };

  const handleJoinEvent = async () => {
    if (!currentUser?._id) {
      toast.error('Bạn cần đăng nhập để tham gia sự kiện');
      return;
    }

    setLoading(true);
    try {
      // Kiểm tra conflict trước khi tham gia
      const conflictCheck = await eventService.checkTimeConflict(
        selectedEvent.startTime,
        selectedEvent.endTime
      );

      if (conflictCheck?.hasConflict) {
        toast.warning('Bạn đã có lịch đặt sân hoặc event khác trùng thời gian. Vui lòng kiểm tra lại lịch của bạn!');
        setLoading(false);
        return;
      }

      // Kiểm tra số dư ví nếu sự kiện yêu cầu thanh toán
      if (selectedEvent.estimatedPrice && selectedEvent.estimatedPrice > 0) {
        try {
          const walletRes = await walletService.getWallet(currentUser._id);
          const currentBalance = walletRes?.wallet?.balance || 0;
          console.log("walletRes", walletRes);
          console.log('Ví hiện tại:', currentBalance, 'Giá event:', selectedEvent.estimatedPrice);
          if (currentBalance < selectedEvent.estimatedPrice) {
            const shortage = selectedEvent.estimatedPrice - currentBalance;
            console.log('Thiếu tiền:', shortage);
            toast.warning(`Số dư ví không đủ! Cần thêm ${shortage.toLocaleString()}đ. Vui lòng nạp tiền vào ví.`);
            setLoading(false);
            return;
          } else {
            console.log('Số dư ví đủ để tham gia event');
          }
        } catch (walletError) {
          console.error('Lỗi kiểm tra ví:', walletError);
          toast.error('Không thể kiểm tra số dư ví!');
          setLoading(false);
          return;
        }
      }

      // Gửi yêu cầu tham gia sự kiện
      const res = await eventService.showInterest(selectedEvent._id, joinNote);

      // Nếu sự kiện yêu cầu thanh toán, tiến hành thanh toán bằng ví
      // Lấy interestId từ interestedPlayers trong res?.data?.data
      const interestId = res?.data?.data?.interestedPlayers?.[res.data.data.interestedPlayers.length - 1]?._id;
      console.log('Response sau khi bày tỏ ý định tham gia:', interestId);
      if (selectedEvent.estimatedPrice && selectedEvent.estimatedPrice > 0) {
        try {
          await walletService.deductFromWallet({
            userId: currentUser._id,
            // eventId: selectedEvent._id,
            amount: selectedEvent.estimatedPrice,
            // interestId: res.data.interestId,
            description: `Thanh toán tham gia sự kiện "${selectedEvent.name} thời gian ${selectedEvent.startTime} - ${selectedEvent.endTime}"`
          });
          toast.success('Đã gửi yêu cầu tham gia sự kiện và thanh toán thành công!');
        } catch (payError) {
          toast.error('Gửi yêu cầu thành công nhưng thanh toán ví thất bại!');
        }
      } else {
        toast.success('Đã gửi yêu cầu tham gia sự kiện!');
      }
      setOpenJoinDialog(false);
      fetchEvents();
      fetchUserSchedule(); // Cập nhật lịch trình
    } catch (error) {
      toast.error(error?.message || 'Không thể tham gia sự kiện');
    }
    setLoading(false);
  };

  const handleLeaveEvent = async (eventId) => {
    if (!window.confirm('Bạn chắc chắn muốn rời khỏi sự kiện này?')) return;

    setLoading(true);
    try {
      // Lấy thông tin event để biết giá
      const event = events.find(e => e._id === eventId) || selectedEvent;
      
      await eventService.leaveEvent(eventId);
      toast.success('Đã rời khỏi sự kiện');
      
      // Hoàn tiền nếu người chơi đã thanh toán
      if (event?.estimatedPrice && currentUser?._id) {
        try {
          const refundData = {
            userId: currentUser._id,
            amount: event.estimatedPrice,
            objectId: eventId,
            type: 'event',
            description: `Hoàn tiền do rời khỏi sự kiện "${event.name}"`
          };
          await walletService.refundToWallet(refundData);
          toast.success('Đã hoàn tiền vào ví của bạn');
        } catch (refundError) {
          console.error('Lỗi hoàn tiền:', refundError);
          // Vẫn tiếp tục vì đã rời sự kiện thành công
        }
      }
      
      fetchEvents();
      fetchUserSchedule(); // Cập nhật lịch trình
      setOpenDetail(false);
    } catch (error) {
      toast.error(error?.message || 'Không thể rời sự kiện');
    }
    setLoading(false);
  };

  const isUserInEvent = (event) => {
    if (!currentUser?._id) return false;
    return event.interestedPlayers?.some(
      player => player.userId?._id === currentUser._id || player.userId === currentUser._id
    );
  };

  const getUserStatusInEvent = (event) => {
    if (!currentUser?._id) return null;
    const player = event.interestedPlayers?.find(
      p => p.userId?._id === currentUser._id || p.userId === currentUser._id
    );
    return player?.status;
  };

  const getPlayerLevelText = (level) => {
    const levels = {
      'any': 'Tất cả',
      'beginner': 'Mới chơi',
      'intermediate': 'Trung bình',
      'advanced': 'Cao cấp'
    };
    return levels[level] || level;
  };

  const getPlayStyleText = (style) => {
    const styles = {
      'any': 'Tất cả',
      'casual': 'Giải trí',
      'competitive': 'Thi đấu',
      'training': 'Tập luyện'
    };
    return styles[style] || style;
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
        Sự kiện Matching (Xé vé)
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Bộ lọc</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              variant="outlined"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              size="small"
              placeholder="Tên sự kiện, tên sân..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Trình độ</InputLabel>
              <Select
                value={filters.playerLevel}
                label="Trình độ"
                onChange={(e) => handleFilterChange('playerLevel', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="beginner">Mới chơi</MenuItem>
                <MenuItem value="intermediate">Trung bình</MenuItem>
                <MenuItem value="advanced">Cao cấp</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Phong cách</InputLabel>
              <Select
                value={filters.playStyle}
                label="Phong cách"
                onChange={(e) => handleFilterChange('playStyle', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="casual">Giải trí</MenuItem>
                <MenuItem value="competitive">Thi đấu</MenuItem>
                <MenuItem value="training">Tập luyện</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Số chỗ trống tối thiểu"
              type="number"
              variant="outlined"
              value={filters.minSlots}
              onChange={(e) => handleFilterChange('minSlots', e.target.value)}
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Từ ngày"
              type="date"
              variant="outlined"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Đến ngày"
              type="date"
              variant="outlined"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Events List */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Sự kiện đang mở ({filteredEvents.length})
      </Typography>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Không có sự kiện nào
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => {
            const acceptedCount = event.interestedPlayers?.filter(p => p.status === 'accepted').length || 0;
            const userStatus = getUserStatusInEvent(event);
            const isInEvent = isUserInEvent(event);

            return (
              <Grid item xs={12} md={6} lg={4} key={event._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {event.fieldId.pricePerHour > 0 && (
                    <Chip
                      icon={<DiscountIcon />}
                      label={`Giá sân ${event.fieldId.pricePerHour}đ/giờ`}
                      color="error"
                      size="small"
                      sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, pr: 5 }}>
                      {event.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {event.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">{event.fieldId?.name}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {dayjs(event.startTime).subtract(7, 'hour').format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {acceptedCount}/{event.maxPlayers} người (Tối thiểu: {event.minPlayers})
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, mt: 1 }}>
                      <Chip label={getPlayerLevelText(event.playerLevel)} size="small" variant="outlined" />
                      <Chip label={getPlayStyleText(event.playStyle)} size="small" variant="outlined" />
                      <Chip 
                        label={`${event.availableSlots} chỗ trống`} 
                        size="small" 
                        color={event.availableSlots > 0 ? 'success' : 'error'}
                      />
                    </Box>

                    {isInEvent && (
                      <Chip
                        label={
                          userStatus === 'pending' ? 'Chờ duyệt' :
                          userStatus === 'accepted' ? 'Đã được chấp nhận' : 'Đã bị từ chối'
                        }
                        size="small"
                        color={
                          userStatus === 'pending' ? 'warning' :
                          userStatus === 'accepted' ? 'success' : 'error'
                        }
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Deadline: {dayjs(event.deadline).subtract(7, 'hour').format('DD/MM/YYYY HH:mm')}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<InfoIcon />}
                        onClick={() => handleViewDetail(event._id)}
                      >
                        Chi tiết
                      </Button>

                      {!isInEvent && event.availableSlots > 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<JoinIcon />}
                          onClick={() => handleOpenJoinDialog(event)}
                        >
                          Tham gia
                        </Button>
                      )}

                      {isInEvent && userStatus !== 'rejected' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<LeaveIcon />}
                          onClick={() => handleLeaveEvent(event._id)}
                          disabled={loading}
                        >
                          Rời khỏi
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

      {/* Dialog Join Event */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tham gia sự kiện</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Bạn muốn tham gia sự kiện <strong>{selectedEvent?.name}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Ghi chú (không bắt buộc)"
            value={joinNote}
            onChange={(e) => setJoinNote(e.target.value)}
            placeholder="Thêm ghi chú của bạn..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleJoinEvent}
            disabled={loading}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Detail Event */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedEvent.name}</Typography>
                {selectedEvent.fieldId.pricePerHour > 0 && (
                  <Chip
                    icon={<DiscountIcon />}
                    label={`Giá sân ${selectedEvent.fieldId.pricePerHour}đ/giờ`}
                    color="error"
                    size="small"
                  />
                )}
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
                    <strong>Giá vé:</strong> {selectedEvent.estimatedPrice?.toLocaleString()}đ/người
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Thời gian:</strong> {dayjs(selectedEvent.startTime).subtract(7, 'hour').format('DD/MM/YYYY HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Deadline:</strong> {dayjs(selectedEvent.deadline).subtract(7, 'hour').format('DD/MM/YYYY HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Số người:</strong> {selectedEvent.minPlayers} - {selectedEvent.maxPlayers} người
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Trình độ:</strong> {getPlayerLevelText(selectedEvent.playerLevel)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Phong cách:</strong> {getPlayStyleText(selectedEvent.playStyle)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Chỗ trống:</strong> {selectedEvent.availableSlots}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Danh sách người tham gia
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedEvent.interestedPlayers?.filter(p => p.status === 'accepted').length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Chưa có người tham gia
                  </Typography>
                ) : (
                  selectedEvent.interestedPlayers
                    ?.filter(p => p.status === 'accepted')
                    .map((player) => (
                      <Box
                        key={player._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 1,
                          bgcolor: '#f5f5f5',
                          borderRadius: 1
                        }}
                      >
                        <Avatar src={player.userId?.avatar}>
                          {player.userId?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{player.userId?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {player.userId?.email}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Button onClick={() => setOpenDetail(false)}>Đóng</Button>
              {!isUserInEvent(selectedEvent) && selectedEvent.availableSlots > 0 && (
                <Button
                  variant="contained"
                  startIcon={<JoinIcon />}
                  onClick={() => {
                    setOpenDetail(false);
                    handleOpenJoinDialog(selectedEvent);
                  }}
                >
                  Tham gia
                </Button>
              )}
              {isUserInEvent(selectedEvent) && getUserStatusInEvent(selectedEvent) !== 'rejected' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LeaveIcon />}
                  onClick={() => handleLeaveEvent(selectedEvent._id)}
                  disabled={loading}
                >
                  Rời khỏi
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EventMatching;