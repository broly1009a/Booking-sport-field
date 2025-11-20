import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TextField, Box, Table, TableHead, TableRow, TableCell, TableBody,
  MenuItem, Select, FormControl, InputLabel, Grid, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import dayjs from 'dayjs';
import { formatTimeVN } from '../../utils/handleFormat';
import { eventService } from '../../services/api/eventService';
import { toast } from 'react-toastify';

const EventDialog = ({ open, onClose, selectedSlots, sportField, onConfirm }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minPlayers: 4,
    maxPlayers: 8,
    playerLevel: 'any',
    playStyle: 'casual',
    teamPreference: 'random',
    discountPercent: 20,
    estimatedPrice: 0,
    deadline: ''
  });
  const [mode, setMode] = useState('discount'); // 'discount' or 'price'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sportField || !selectedSlots || selectedSlots.length === 0) return;
    const sortedSlots = [...selectedSlots].sort((a, b) => new Date(a.time) - new Date(b.time));
    const startTime = dayjs(sortedSlots[0].time).add(7, 'hour').toDate().toISOString();
    const duration = selectedSlots.length * 0.5; // giờ
    const fieldPrice = sportField.pricePerHour || sportField.price;

    const calculateEstimatedPrice = (discountPercent, maxPlayers) => {
      return Math.round(fieldPrice * duration * (1 - discountPercent / 100) / maxPlayers);
    };

    setFormData(prev => {
      const newData = { ...prev };
      if (mode === 'discount') {
        newData.estimatedPrice = calculateEstimatedPrice(newData.discountPercent, newData.maxPlayers);
      } else {
        newData.discountPercent = Math.round(100 * (1 - (newData.estimatedPrice * newData.maxPlayers) / (fieldPrice * duration)));
      }
      return newData;
    });
  }, [mode, sportField, selectedSlots]);

  if (!sportField || !selectedSlots || selectedSlots.length === 0) {
    return null;
  }

  const sortedSlots = [...selectedSlots].sort((a, b) => new Date(a.time) - new Date(b.time));
  
  // console.log('Sorted Slots:', sortedSlots);
  // console.log('First slot time:', sortedSlots[0].time);
  // console.log('Last slot time:', sortedSlots[sortedSlots.length - 1].time);
  
  const startTime = dayjs(sortedSlots[0].time).add(7, 'hour').toDate().toISOString();
  const endTime = dayjs(sortedSlots[sortedSlots.length - 1].time).add(7 + 0.5, 'hour').toDate().toISOString();
  
  const duration = selectedSlots.length * 0.5; // giờ
  const fieldPrice = sportField.pricePerHour || sportField.price;

  const calculateEstimatedPrice = (discountPercent, maxPlayers) => {
    return Math.round(fieldPrice * duration * (1 - discountPercent / 100) / maxPlayers);
  };

  const calculateDiscountPercent = (estimatedPrice, maxPlayers) => {
    return Math.round(100 * (1 - (estimatedPrice * maxPlayers) / (fieldPrice * duration)));
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'maxPlayers') {
        if (mode === 'discount') {
          newData.estimatedPrice = calculateEstimatedPrice(newData.discountPercent, newData.maxPlayers);
        } else {
          newData.discountPercent = calculateDiscountPercent(newData.estimatedPrice, newData.maxPlayers);
        }
      } else if (field === 'discountPercent' && mode === 'discount') {
        newData.estimatedPrice = calculateEstimatedPrice(newData.discountPercent, newData.maxPlayers);
      } else if (field === 'estimatedPrice' && mode === 'price') {
        newData.discountPercent = calculateDiscountPercent(newData.estimatedPrice, newData.maxPlayers);
      }
      return newData;
    });
  };
    // const now = new Date();
    // console.log('Current time:', now);
  const handleConfirm = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sự kiện!');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả sự kiện!');
      return;
    }
    if (formData.minPlayers > formData.maxPlayers) {
      toast.error('Số người tối thiểu phải nhỏ hơn hoặc bằng số người tối đa!');
      return;
    }

    // Validate thời gian bắt đầu phải sau hiện tại ít nhất 2 tiếng để deadline hợp lệ
    const now = new Date();
    // console.log('Current time:', now.toString());
    const minStartTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    if (dayjs(startTime).isBefore(minStartTime)) {
      toast.error('Thời gian bắt đầu phải sau thời gian hiện tại ít nhất 2 tiếng để có deadline đăng ký hợp lệ!');
      return;
    }

    // Validate deadline nếu có
    let deadline;
    if (formData.deadline) {
      deadline = dayjs(formData.deadline).add(7, 'hour'); // Cộng 7 tiếng để UTC
      if (deadline.isBefore(now)) {
        toast.error('Deadline phải sau thời gian hiện tại!');
        return;
      }
      if (deadline.isAfter(dayjs(startTime))) {
        toast.error('Deadline phải trước thời gian bắt đầu sự kiện!');
        return;
      }
    } else {
      deadline = dayjs(startTime).subtract(2, 'hour');
    }

    setLoading(true);
    try {
      const eventData = {
        name: formData.name,
        description: formData.description,
        minPlayers: formData.minPlayers,
        maxPlayers: formData.maxPlayers,
        playerLevel: formData.playerLevel,
        playStyle: formData.playStyle,
        teamPreference: formData.teamPreference,
        fieldId: sportField._id,
        startTime,
        endTime,
        deadline: deadline.toISOString(),
        ...(mode === 'price' ? { estimatedPrice: formData.estimatedPrice } : { discountPercent: formData.discountPercent })
      };
      
      // console.log('=== EVENT DATA BEING SENT ===');
      // console.log('Event Data:', JSON.stringify(eventData, null, 2));
      // console.log('startTime type:', typeof eventData.startTime);
      // console.log('endTime type:', typeof eventData.endTime);
      // console.log('============================');
      
      const result = await eventService.createEvent(eventData);
      
      // console.log('=== EVENT RESPONSE ===');
      // console.log('Result:', JSON.stringify(result, null, 2));
      // console.log('======================');
      
      toast.success('Tạo sự kiện matching thành công!');
      if (onConfirm) onConfirm();
      setFormData({
        name: '',
        description: '',
        minPlayers: 4,
        maxPlayers: 8,
        playerLevel: 'any',
        playStyle: 'casual',
        teamPreference: 'random',
        discountPercent: 20,
        estimatedPrice: 0,
        deadline: ''
      });
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Tạo sự kiện thất bại!');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      minPlayers: 4,
      maxPlayers: 8,
      playerLevel: 'any',
      playStyle: 'casual',
      teamPreference: 'random',
      discountPercent: 20,
      estimatedPrice: 0,
      deadline: ''
    });
    setMode('discount');
    onClose();
  };
//   console.log('Selected Slots:', selectedSlots);
// log ra thông tin sân đặt
// console.log('Sport Field:', sportField);
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', textAlign: 'center' }}>
        Tạo sự kiện matching (Xé vé)
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>Thông tin sân</Typography>
          <Typography>Tên sân: <strong>{sportField.name}</strong></Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#1976d2', mb: 1 }}>Khung giờ</Typography>
          <Table size="small" sx={{ mt: 1, border: '1px solid #e0e0e0' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Khung giờ</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSlots.map((slot, index) => {
                const time = dayjs(slot.time);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {formatTimeVN(time)} - {formatTimeVN(time.add(30, 'minute'))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
            Deadline đăng ký: {formData.deadline ? formatTimeVN(dayjs(formData.deadline)) : formatTimeVN(dayjs(startTime).subtract(9, 'hour'))}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <TextField
              label="Tên sự kiện"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              fullWidth
              required
              placeholder="VD: Giao hữu bóng đá cuối tuần"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Mô tả sự kiện"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              fullWidth
              required
              multiline
              rows={2}
              placeholder="Mô tả chi tiết về sự kiện..."
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Số người tối thiểu"
              type="number"
              value={formData.minPlayers}
              onChange={e => handleChange('minPlayers', parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 4, max: 8 }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Số người tối đa"
              type="number"
              value={formData.maxPlayers}
              onChange={e => handleChange('maxPlayers', parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 4, max: 8 }}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Trình độ người chơi</InputLabel>
              <Select
                value={formData.playerLevel}
                onChange={e => handleChange('playerLevel', e.target.value)}
                label="Trình độ người chơi"
              >
                <MenuItem value="any">Tất cả</MenuItem>
                <MenuItem value="beginner">Mới chơi</MenuItem>
                <MenuItem value="intermediate">Trung bình</MenuItem>
                <MenuItem value="advanced">Cao cấp</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Phong cách chơi</InputLabel>
              <Select
                value={formData.playStyle}
                onChange={e => handleChange('playStyle', e.target.value)}
                label="Phong cách chơi"
              >
                <MenuItem value="any">Tất cả</MenuItem>
                <MenuItem value="casual">Giải trí</MenuItem>
                <MenuItem value="competitive">Thi đấu</MenuItem>
                <MenuItem value="training">Tập luyện</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Sắp xếp đội</InputLabel>
              <Select
                value={formData.teamPreference}
                onChange={e => handleChange('teamPreference', e.target.value)}
                label="Sắp xếp đội"
              >
                <MenuItem value="random">Ngẫu nhiên</MenuItem>
                <MenuItem value="fixed">Cố định</MenuItem>
                <MenuItem value="balanced">Cân bằng</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Deadline đăng ký (tùy chọn)"
              type="datetime-local"
              value={formData.deadline}
              onChange={e => handleChange('deadline', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Để trống sẽ mặc định 2 giờ trước bắt đầu"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="body1" sx={{ mb: 1 }}>Chọn cách tính giá:</Typography>
              <RadioGroup
                row
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <FormControlLabel value="discount" control={<Radio />} label="Nhập % giảm giá" />
                <FormControlLabel value="price" control={<Radio />} label="Nhập giá ước tính" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {mode === 'discount' && (
            <Grid item xs={6}>
              <TextField
                label="Giảm giá (%)"
                type="number"
                value={formData.discountPercent}
                onChange={e => handleChange('discountPercent', parseInt(e.target.value))}
                fullWidth
                inputProps={{ min: 0, max: 50 }}
                helperText={`Giá ước tính: ${calculateEstimatedPrice(formData.discountPercent, formData.maxPlayers).toLocaleString()}đ`}
              />
            </Grid>
          )}

          {mode === 'price' && (
            <Grid item xs={6}>
              <TextField
                label="Giá ước tính (đ)"
                type="number"
                value={formData.estimatedPrice}
                onChange={e => handleChange('estimatedPrice', parseInt(e.target.value))}
                fullWidth
                inputProps={{ min: 0 }}
                helperText={`Giảm giá: ${calculateDiscountPercent(formData.estimatedPrice, formData.maxPlayers)}%`}
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>Lưu ý:</strong> Sự kiện sẽ tự động hủy nếu không đủ người trước deadline. 
            Người chơi sẽ tự đăng ký và bạn chấp nhận/từ chối.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={handleClose} sx={{ color: '#666' }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          disabled={loading}
        >
          {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;