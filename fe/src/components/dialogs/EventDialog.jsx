import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TextField, Box, Table, TableHead, TableRow, TableCell, TableBody,
  MenuItem, Select, FormControl, InputLabel, Grid
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
    discountPercent: 20
  });
  const [loading, setLoading] = useState(false);

  if (!sportField || !selectedSlots || selectedSlots.length === 0) return null;

  const sortedSlots = [...selectedSlots].sort((a, b) => new Date(a.time) - new Date(b.time));
  
  console.log('Sorted Slots:', sortedSlots);
  console.log('First slot time:', sortedSlots[0].time);
  console.log('Last slot time:', sortedSlots[sortedSlots.length - 1].time);
  
  const startTime = dayjs(sortedSlots[0].time).add(7, 'hour').toDate().toISOString();
  const endTime = dayjs(sortedSlots[sortedSlots.length - 1].time).add(7 + 0.5, 'hour').toDate().toISOString();
  
  console.log('Calculated startTime:', startTime);
  console.log('Calculated endTime:', endTime);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

    setLoading(true);
    try {
      const deadline = dayjs(startTime).subtract(2, 'hour').toDate().toISOString();
      
      const eventData = {
        ...formData,
        fieldId: sportField._id,
        startTime,
        endTime,
        deadline
      };
      
      console.log('=== EVENT DATA BEING SENT ===');
      console.log('Event Data:', JSON.stringify(eventData, null, 2));
      console.log('startTime type:', typeof eventData.startTime);
      console.log('endTime type:', typeof eventData.endTime);
      console.log('============================');
      
      const result = await eventService.createEvent(eventData);
      
      console.log('=== EVENT RESPONSE ===');
      console.log('Result:', JSON.stringify(result, null, 2));
      console.log('======================');
      
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
        discountPercent: 20
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
      discountPercent: 20
    });
    onClose();
  };
//   console.log('Selected Slots:', selectedSlots);
// log ra thông tin sân đặt
console.log('Sport Field:', sportField);
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
            Deadline đăng ký: {formatTimeVN(dayjs(startTime).subtract(2, 'hour'))}
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
              label="Giảm giá (%)"
              type="number"
              value={formData.discountPercent}
              onChange={e => handleChange('discountPercent', parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 0, max: 50 }}
              helperText={`Giá gốc giảm ${formData.discountPercent}%`}
            />
          </Grid>
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