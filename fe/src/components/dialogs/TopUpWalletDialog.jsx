import React, { useState } from 'react';
import { paymentService } from '../../services/api/paymentService';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

export default function TopUpWalletDialog({ open, onClose, userId }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    setLoading(true);
    try {
      const res = await paymentService.topUpWallet({ userId, amount: Number(amount) });
      if (res?.vnpUrl) {
        window.location.href = res.vnpUrl; // Redirect to VNPAY
      }
    } catch (error) {
      alert('Nạp tiền thất bại!');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Nạp tiền vào ví</DialogTitle>
      <DialogContent>
        <TextField
          label="Số tiền"
          type="number"
          fullWidth
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleTopUp} disabled={loading} variant="contained">Nạp tiền</Button>
      </DialogActions>
    </Dialog>
  );
}