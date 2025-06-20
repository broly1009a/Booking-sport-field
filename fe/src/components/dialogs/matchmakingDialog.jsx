import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import matchmakingService from '../../services/api/matchmakingService';

const MatchmakingDialog = ({
  open,
  onClose,
  bookingId,
  userId,
}) => {
  const navigate = useNavigate();
  const [requiredPlayers, setRequiredPlayers] = useState(1);

  const handleCreateMatchmaking = async () => {
    try {
      const response = await matchmakingService.createMatchmaking({
        bookingId,
        userId,
        requiredPlayers,
        joinedPlayers: []
      });
      toast.success('Tạo phòng ghép trận thành công!');
      onClose();
      navigate('/');
    } catch (error) {
      toast.error('Tạo phòng ghép trận thất bại!');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Ghép trận</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Nhập số người chơi cần thêm để đủ đội:
        </Typography>
        <TextField
          type="number"
          label="Số người cần thêm"
          value={requiredPlayers}
          onChange={e => setRequiredPlayers(Number(e.target.value))}
          inputProps={{ min: 1 }}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleCreateMatchmaking} color="primary" variant="contained">
          Tạo phòng ghép trận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchmakingDialog;