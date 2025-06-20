import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import dayjs from 'dayjs';
import NotificationSnackbar from '../snackbars/notificationSnackbar';
import ThankForBooking from './thankForBooking';
import EditProfileDialog from './editProfileDialog';
import sportFieldService from '../../services/api/sportFieldService';
import { useState, useEffect } from 'react';
import { formatTimeVN } from '../../utils/handleFormat';
import bookingService from '../../services/api/bookingService';
import consumableService from '../../services/api/consumableService';
import equipmentService from '../../services/api/equipmentService';

export default function BookingDialog({ open, onClose, selectedSlots, sportField, userId, onConfirm }) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [openThankDialog, setOpenThankDialog] = useState(false);
  const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [messageNotification, setMessageNotification] = useState('');
  const [severityNotification, setSeverityNotification] = useState('info');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      if (!sportField?._id) return;
      try {
        const [equipRes, consRes] = await Promise.all([
          equipmentService.getAvailableEquipmentBySportField(sportField._id),
          consumableService.getAvailableConsumablesBySportField(sportField._id)
        ]);
        const equipment = (equipRes?.data || []).map(item => ({ ...item, type: 'equipment', quantity: 0 }));
        const consumables = (consRes?.data || []).map(item => ({ ...item, type: 'consumable', quantity: 0 }));
        setSelectedItems([...equipment, ...consumables]);
      } catch (err) {
        setSelectedItems([]);
      }
    };

    if (open) {
      setCustomerName('');
      setPhoneNumber('');
      setNote('');
      fetchItems();
    }
  }, [open, sportField?._id]);

  if (!sportField || !selectedSlots || selectedSlots.length === 0) {
    return null;
  }

  const calculateTotal = () => {
    const times = selectedSlots.map(slot => dayjs(slot.time)).sort((a, b) => a - b);
    const startTime = times[0];
    const endTime = times[times.length - 1].add(30, 'minute');
    const hours = endTime.diff(startTime, 'hour', true);
    const fieldTotal = hours * sportField.pricePerHour;
    const itemsTotal = selectedItems.reduce(
      (sum, item) => sum + (item.pricePerUnit || item.price) * item.quantity,
      0
    );
    return fieldTotal + itemsTotal;
  };

  const calculateFieldTotal = () => {
    const times = selectedSlots.map(slot => dayjs(slot.time)).sort((a, b) => a - b);
    const startTime = times[0];
    const endTime = times[times.length - 1].add(30, 'minute');
    const hours = endTime.diff(startTime, 'hour', true);
    return hours * sportField.pricePerHour;
  };

  const handleQuantityChange = (itemId, delta) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item._id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const confirmBooking = async (bookingData) => {
    setLoading(true);
    try {
      const res = await bookingService.createBooking(bookingData);
      if (res) {
        setMessageNotification('Đặt lịch thành công!');
        setSeverityNotification('success');
        setOpenNotification(true);
        setOpenThankDialog(true);
        if (onConfirm) onConfirm(res.data, selectedItems);
        onClose();
      }
    } catch (error) {
      setMessageNotification('Đặt lịch thất bại!');
      setSeverityNotification('error');
      setOpenNotification(true);
    }
    setLoading(false);
  };

 const handleConfirm = () => {
  if (!customerName || !phoneNumber) {
    setMessageNotification('Vui lòng nhập đầy đủ tên và số điện thoại');
    setSeverityNotification('error');
    setOpenNotification(true);
    return;
  }
  // Sắp xếp các slot theo thời gian tăng dần
  const sortedSlots = [...selectedSlots].sort((a, b) => new Date(a.time) - new Date(b.time));
  // Cộng thêm 7 tiếng trước khi format ISO
  const startTime = dayjs(sortedSlots[0].time).add(7, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
  const endTime = dayjs(sortedSlots[sortedSlots.length - 1].time).add(7 + 0.5, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
  const totalPrice = calculateFieldTotal();

  const bookingData = {
    userId,
    fieldId: sportField._id,
    fieldName: sportField.name,
    startTime,
    endTime,
    status: 'pending',
    totalPrice,
    participants: [],
    customerName,
    phoneNumber,
    note: note,
  };

  confirmBooking(bookingData);
};
  console.log('Selected Slots:', selectedSlots);
  return (
    <React.Fragment>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#388e3c', color: 'white', textAlign: 'center' }}>
          Đặt lịch ngay trực quan
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2, bgcolor: '#e0f2e9', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: '#388e3c' }}>Thông tin sân</Typography>
            <Typography>Tên CLB: CN Q9 CLB Pickleball Hoàng Thành Trung</Typography>
            <Typography>Địa chỉ: 449 Lê Văn Việt quận 9 (bên trong trường Đào tạo bộ đội đường Nghiệp vụ Kiểm sát)</Typography>
            <Typography>SĐT: 0918435436</Typography>
          </Box>

          <Box sx={{ mb: 2, bgcolor: '#e0f2e9', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: '#388e3c' }}>Thông tin lịch đặt</Typography>
            <Table sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Khung giờ</TableCell>
                  <TableCell>Giá</TableCell>
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
                      <TableCell>{sportField.pricePerHour.toLocaleString()}đ</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Typography>Địa điểm: {sportField.name}</Typography>
            <Typography>Tổng giờ: {selectedSlots.length * 0.5}h</Typography>
            <Typography>Tổng tiền sân: {calculateFieldTotal().toLocaleString()}đ</Typography>
          </Box>

          <Box sx={{ mb: 2, bgcolor: '#e0f2e9', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: '#388e3c' }}>Thuê thêm thiết bị hoặc đồ tiêu thụ</Typography>
            <Table sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tên</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Tổng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedItems.map(item => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type === 'equipment' ? 'Thiết bị' : 'Đồ tiêu thụ'}</TableCell>
                    <TableCell>{(item.pricePerUnit || item.price).toLocaleString()}đ</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => handleQuantityChange(item._id, -1)}>
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          sx={{ width: 60, mx: 1 }}
                          inputProps={{ style: { textAlign: 'center' } }}
                          onChange={e =>
                            handleQuantityChange(item._id, parseInt(e.target.value) - item.quantity)
                          }
                        />
                        <IconButton onClick={() => handleQuantityChange(item._id, 1)}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{((item.pricePerUnit || item.price) * item.quantity).toLocaleString()}đ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography sx={{ mt: 1 }}>
              Tổng tiền thiết bị/đồ tiêu thụ: {selectedItems.reduce((sum, item) => sum + (item.pricePerUnit || item.price) * item.quantity, 0).toLocaleString()}đ
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#388e3c' }}>Tên người đặt</Typography>
            <TextField
              fullWidth
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nhập tên người đặt"
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#388e3c' }}>Số điện thoại</Typography>
            <TextField
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại"
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: '#f44336' }}>+84</Typography>
                )
              }}
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#388e3c' }}>Ghi chú cho chủ sân</Typography>
            <TextField
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú"
              multiline
              rows={2}
            />
          </Box>

          <Typography sx={{ fontWeight: 'bold', color: '#388e3c' }}>
            Tổng cộng: {calculateTotal().toLocaleString()}đ
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={onClose} sx={{ color: '#388e3c' }}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{ bgcolor: '#ffca28', color: 'black', '&:hover': { bgcolor: '#ffb300' } }}
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Xác nhận & Thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>
      <NotificationSnackbar
        open={openNotification}
        setOpen={setOpenNotification}
        message={messageNotification}
        severity={severityNotification}
      />
      <ThankForBooking open={openThankDialog} setOpen={setOpenThankDialog} />
      <EditProfileDialog open={openEditProfileDialog} setOpen={setOpenEditProfileDialog} />
    </React.Fragment>
  );
}