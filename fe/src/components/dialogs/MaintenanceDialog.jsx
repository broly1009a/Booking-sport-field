import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TextField, Box, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import dayjs from 'dayjs';
import { formatTimeVN } from '../../utils/handleFormat';
import maintenanceService from '../../services/api/maintenanceService';
import { toast } from 'react-toastify';
const MaintenanceDialog = ({ open, onClose, selectedSlots, sportField, onConfirm }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!sportField || !selectedSlots || selectedSlots.length === 0) return null;

  const sortedSlots = [...selectedSlots].sort((a, b) => new Date(a.time) - new Date(b.time));
  const startTime = dayjs(sortedSlots[0].time).add(7, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
  const endTime = dayjs(sortedSlots[sortedSlots.length - 1].time).add(7 + 0.5, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await maintenanceService.createMaintenance({
        fieldId: sportField._id,
        startTime,
        endTime,
        description,
        status: 'scheduled'
      });
      toast.success('Đặt lịch bảo trì thành công!');
      if (onConfirm) onConfirm();
      setDescription('');
      onClose();
    } catch (err) {
      toast.error('Đặt lịch bảo trì thất bại!');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#388e3c', color: 'white', textAlign: 'center' }}>
        Đặt lịch bảo trì sân
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#388e3c' }}>Thông tin sân</Typography>
          <Typography>Tên sân: {sportField.name}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#388e3c' }}>Khung giờ bảo trì</Typography>
          <Table sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Khung giờ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedSlots.map((slot, index) => {
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
        </Box>
        <TextField
          label="Mô tả bảo trì"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={handleClose} sx={{ color: '#388e3c' }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{ bgcolor: '#ffca28', color: 'black', '&:hover': { bgcolor: '#ffb300' } }}
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceDialog;