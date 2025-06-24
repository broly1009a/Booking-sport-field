import React, { useState } from 'react';
import { paymentService } from '../../services/api/paymentService';
import { Button } from '@mui/material';

export default function PayByWalletButton({ bookingId, userId, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await paymentService.payBookingByWallet({ bookingId, userId, amount });
      if (onSuccess) onSuccess(res.data);
      alert('Thanh toán thành công bằng ví!');
    } catch (error) {
      alert('Thanh toán bằng ví thất bại!');
    }
    setLoading(false);
  };

  return (
    <Button variant="contained" color="success" onClick={handlePay} disabled={loading}>
      Thanh toán bằng ví
    </Button>
  );
}