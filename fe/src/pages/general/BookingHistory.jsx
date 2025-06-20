import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/authContext';
import bookingService from '../../services/api/bookingService';

const statusMap = {
  pending: { label: 'Đang chờ', color: 'warning' },
  confirmed: { label: 'Đã xác nhận', color: 'success' },
  cancelled: { label: 'Đã hủy', color: 'error' },
  completed: { label: 'Hoàn thành', color: 'primary' }
};

const BookingHistory = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?._id) return;
      setLoading(true);
      const res = await bookingService.getBookingsByUser(currentUser._id);
      setBookings(res?.data || []);
      setLoading(false);
    };
    fetchBookings();
  }, [currentUser]);

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#388e3c' }}>
        Lịch sử đặt sân của bạn
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sân</TableCell>
              <TableCell>Địa điểm</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Ghép trận</TableCell>
              <TableCell>Chi tiết</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Đang tải...</TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Bạn chưa có lịch sử đặt sân nào</TableCell>
              </TableRow>
            ) : (
              bookings.map(b => (
                <TableRow key={b._id}>
                  <TableCell>{b.field?.name}</TableCell>
                  <TableCell>{b.field?.location}</TableCell>
                  <TableCell>
                    {dayjs(b.startTime).format('HH:mm DD/MM/YYYY')} - {dayjs(b.endTime).format('HH:mm DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[b.status]?.label || b.status}
                      color={statusMap[b.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{b.totalPrice?.toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell>
                    {b.matchmaking && b.matchmaking.length > 0
                      ? (
                        <Chip
                          label={`Đã tạo (${b.matchmaking[0].status === 'open' ? 'Đang mở' : 'Đã đủ' })`}
                          color={b.matchmaking[0].status === 'open' ? 'info' : 'success'}
                          size="small"
                        />
                      )
                      : 'Không'}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => setSelectedBooking(b)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog chi tiết booking */}
      <Dialog open={!!selectedBooking} onClose={() => setSelectedBooking(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết đặt sân</DialogTitle>
      <DialogContent dividers>
    {selectedBooking && (
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">Sân: {selectedBooking.field?.name}</Typography>
        <Typography>Địa điểm: {selectedBooking.field?.location}</Typography>
        <Typography>Loại sân: {selectedBooking.field?.type}</Typography>
        <Typography>Sức chứa: {selectedBooking.field?.capacity}</Typography>
        <Typography>Trạng thái sân: {selectedBooking.field?.status}</Typography>
        <Typography>Giá/giờ: {selectedBooking.field?.pricePerHour?.toLocaleString('vi-VN')}đ</Typography>
        <Typography>
          Tiện ích: {selectedBooking.field?.amenities?.length > 0
            ? selectedBooking.field.amenities.join(', ')
            : 'Không có'}
        </Typography>
        {selectedBooking.field?.images?.length > 0 && (
          <Box sx={{ my: 1 }}>
            <Typography>Ảnh sân:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedBooking.field.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`field-img-${idx}`}
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </Box>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography>Thời gian: {dayjs(selectedBooking.startTime).format('HH:mm DD/MM/YYYY')} - {dayjs(selectedBooking.endTime).format('HH:mm DD/MM/YYYY')}</Typography>
        <Typography>Trạng thái booking: <Chip label={statusMap[selectedBooking.status]?.label || selectedBooking.status} color={statusMap[selectedBooking.status]?.color || 'default'} size="small" /></Typography>
        <Typography>Tổng tiền: {selectedBooking.totalPrice?.toLocaleString('vi-VN')}đ</Typography>
        <Typography>Tên người đặt: {selectedBooking.customerName}</Typography>
        <Typography>Số điện thoại: {selectedBooking.phoneNumber}</Typography>
        {selectedBooking.notes && <Typography>Ghi chú: {selectedBooking.notes}</Typography>}
        <Typography>Ngày tạo: {dayjs(selectedBooking.createdAt).format('HH:mm DD/MM/YYYY')}</Typography>
        <Typography>Ngày cập nhật: {dayjs(selectedBooking.updatedAt).format('HH:mm DD/MM/YYYY')}</Typography>
        <Typography>
          Người tham gia: {selectedBooking.participants && selectedBooking.participants.length > 0
            ? selectedBooking.participants.map(p => p?.fname ? `${p.fname} ${p.lname}` : p).join(', ')
            : 'Chỉ có bạn'}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" fontWeight="bold">Ghép trận:</Typography>
        {selectedBooking.matchmaking && selectedBooking.matchmaking.length > 0 ? (
          <Chip
            label={`Đã tạo (${selectedBooking.matchmaking[0].status === 'open' ? 'Đang mở' : 'Đã đủ'})`}
            color={selectedBooking.matchmaking[0].status === 'open' ? 'info' : 'success'}
            size="small"
          />
        ) : (
          <Typography>Không</Typography>
        )}
      </Box>
    )}
  </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBooking(null)} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingHistory;