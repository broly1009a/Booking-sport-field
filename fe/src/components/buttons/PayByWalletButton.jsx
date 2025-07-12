import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { paymentService } from '../../services/api/paymentService';

export default function PayByWalletButton({ bookingId, userId, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await paymentService.payBookingByWallet({ bookingId, userId, amount });
      setSnackbar({ open: true, message: 'Thanh toán thành công bằng ví!', severity: 'success' });
      if (onSuccess) onSuccess(res.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Thanh toán bằng ví thất bại!', severity: 'error' });
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="success"
        onClick={handlePay}
        disabled={loading}
        sx={{ ml: 1 }}
      >
        {loading ? 'Đang thanh toán...' : 'Thanh toán bằng ví'}
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}