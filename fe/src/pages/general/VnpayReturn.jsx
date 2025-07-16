import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/api/paymentService';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, Typography, Box } from '@mui/material';

export default function VnpayReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Đang xác nhận thanh toán...');

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(location.search));
    const paymentId = params.vnp_TxnRef;
    paymentService.getVnpayReturn(params)
      .then(async res => {
        setMessage(res?.message || 'Thanh toán thành công!');
        if (res?.message === 'Payment successful') {
          if (paymentId) {
            try {
              const bookingRes = await paymentService.getBookingByPaymentId(paymentId);
              const bookingData = bookingRes?.data;
              setTimeout(() => {
                if (bookingData?._id) {
                  navigate(`/booking-success/${bookingData._id}`, { state: { bookingData } });
                } else {
                  navigate('/booking-history');
                }
              }, 2000);
            } catch {
              setTimeout(() => navigate('/'), 2000);
            }
          } else {
            setTimeout(() => navigate('/booking-history'), 2000);
          }
        } else {
          setTimeout(() => navigate('/'), 2000);
        }
      })
      .catch(() => {
        setMessage('Thanh toán thất bại!');
        setTimeout(() => navigate('/'), 2000);
      });
  }, [location, navigate]);

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="h5">{message}</Typography>
    </Box>
  );
}