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
// import ThankForBooking from './thankForBooking';
// import EditProfileDialog from './editProfileDialog';
// import sportFieldService from '../../services/api/sportFieldService';
import { useState, useEffect } from 'react';
import { formatTimeVN } from '../../utils/handleFormat';
import { paymentService } from '../../services/api/paymentService';
import consumableService from '../../services/api/consumableService';
import equipmentService from '../../services/api/equipmentService';
import { useAuth } from '../../contexts/authContext';
import PayByWalletButton from '../buttons/PayByWalletButton';
import bookingService from '../../services/api/bookingService';
import { useNavigate } from 'react-router-dom';
export default function BookingDialog({ open, onClose, selectedSlots, sportField, userId, onConfirm }) {

  const [note, setNote] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [openNotification, setOpenNotification] = useState(false);
  const [messageNotification, setMessageNotification] = useState('');
  const [severityNotification, setSeverityNotification] = useState('info');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const navigate = useNavigate();
const [createdBookingData, setCreatedBookingData] = useState(null);
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
      setCustomerName(
        currentUser
          ? `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim()
          : ''
      );
      setPhoneNumber(currentUser?.phoneNumber || '');
      setNote('');
      fetchItems();
    }
  }, [open, sportField?._id, currentUser]);

  if (!sportField || !selectedSlots || selectedSlots.length === 0) {
    return null;
  }

  const calculateFieldTotal = () => {
    const times = selectedSlots.map(slot => dayjs(slot.time)).sort((a, b) => a - b);
    const startTime = times[0];
    const endTime = times[times.length - 1].add(30, 'minute');
    const hours = endTime.diff(startTime, 'hour', true);
    return hours * sportField.pricePerHour;
  };

  const calculateItemsTotal = () =>
    selectedItems.reduce(
      (sum, item) => sum + (item.pricePerUnit || item.price) * item.quantity,
      0
    );

  const calculateTotal = () => calculateFieldTotal() + calculateItemsTotal();

  const handleQuantityChange = (itemId, delta) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item._id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const handleConfirm = async () => {
    if (!customerName || !phoneNumber) {
      setMessageNotification('Vui lòng nhập đầy đủ tên và số điện thoại');
      setSeverityNotification('error');
      setOpenNotification(true);
      return;
    }
    setLoading(true);
    try {
      // Sắp xếp các slot theo thời gian tăng dần
      const sortedSlots = [...selectedSlots].sort((a, b) => new Date(a.time) - new Date(b.time));
      const startTime = dayjs(sortedSlots[0].time).add(7, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
      const endTime = dayjs(sortedSlots[sortedSlots.length - 1].time).add(7 + 0.5, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
      const totalPrice = calculateFieldTotal();
      const items = selectedItems
        .filter(item => item.quantity > 0)
        .map(item => ({
          productId: item._id,
          type: item.type,
          name: item.name,
          price: item.pricePerUnit || item.price,
          quantity: item.quantity
        }));

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
        note,
        items // gửi lên BE để lưu thiết bị/đồ tiêu thụ nếu cần
      };

      // Gọi API thanh toán online
      const res = await paymentService.createBookingAndPayment(bookingData);
      console.log('Payment response:', res?.data?.vnpUrl);
      console.log('Payment response res:', res);
      console.log('Payment response res vnp:', res?.vnpUrl);

      if (res?.vnpUrl) {
        window.location.href = res.vnpUrl; // Đúng!
      } else {
        setMessageNotification('Không lấy được link thanh toán!');
        setSeverityNotification('error');
        setOpenNotification(true);
      }
      if (onConfirm) onConfirm(res.data, selectedItems);
    } catch (error) {
      setMessageNotification('Đặt sân thất bại!');
      setSeverityNotification('error');
      setOpenNotification(true);
    }
    setLoading(false);
  };
  const handleCreateBooking = async () => {
  if (!customerName || !phoneNumber) {
    setMessageNotification('Vui lòng nhập đầy đủ tên và số điện thoại');
    setSeverityNotification('error');
    setOpenNotification(true);
    return;
  }
  setLoading(true);
  try {
    const sortedSlots = [...selectedSlots].sort((a, b) => new Date(a.time) - new Date(b.time));
    const startTime = dayjs(sortedSlots[0].time).add(7, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
    const endTime = dayjs(sortedSlots[sortedSlots.length - 1].time).add(7 + 0.5, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
    const totalPrice = calculateFieldTotal();
    const items = selectedItems
      .filter(item => item.quantity > 0)
      .map(item => ({
        productId: item._id,
        type: item.type,
        name: item.name,
        price: item.pricePerUnit || item.price,
        quantity: item.quantity
      }));

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
      note,
      items
    };

    const res = await bookingService.createBooking(bookingData);
    if (res?.data?._id) {
      setCreatedBookingId(res.data._id);
      setCreatedBookingData(res.data); // Lưu booking data vào state
      setMessageNotification('Tạo booking thành công, vui lòng thanh toán bằng ví!');
      setSeverityNotification('success');
      setOpenNotification(true);
    } else {
      setMessageNotification('Tạo booking thất bại!');
      setSeverityNotification('error');
      setOpenNotification(true);
    }
  } catch (error) {
    setMessageNotification('Tạo booking thất bại!');
    setSeverityNotification('error');
    setOpenNotification(true);
  }
  setLoading(false);
};
  const handleCancel = async () => {
    if (createdBookingId) {
      try {
        await bookingService.updateBooking(createdBookingId, { status: 'cancelled' });
        setMessageNotification('Hủy đặt lịch thành công');
        setSeverityNotification('success');
        setOpenNotification(true);
        onClose();
      } catch (error) {
        setMessageNotification('Hủy đặt lịch thất bại');
        setSeverityNotification('error');
        setOpenNotification(true);
      }
    } else {
      onClose();
    }
  };
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
                      <TableCell>{(sportField.pricePerHour * 0.5).toLocaleString()}đ</TableCell>
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
              Tổng tiền thiết bị/đồ tiêu thụ: {calculateItemsTotal().toLocaleString()}đ
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
          <Button onClick={handleCancel} sx={{ color: '#388e3c' }}>Hủy</Button>
          {!createdBookingId && (
            <>
              <Button
                variant="contained"
                onClick={handleConfirm}
                sx={{ bgcolor: '#ffca28', color: 'black', '&:hover': { bgcolor: '#ffb300' } }}
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Xác nhận & Thanh toán'}
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleCreateBooking}
                disabled={loading}
                sx={{ ml: 1 }}
              >
                {loading ? 'Đang tạo booking...' : 'Tạo booking & Thanh toán ví'}
              </Button>
            </>
          )}
        {createdBookingId && (
  <PayByWalletButton
    bookingId={createdBookingId}
    userId={userId}
    amount={calculateTotal()}
    onSuccess={() => {
      // Dùng createdBookingData từ state thay vì bookingData từ callback
      console.log('Booking ID:', createdBookingData?._id);
      console.log('Booking Data:', createdBookingData);
      setMessageNotification('Thanh toán thành công bằng ví!');
      setSeverityNotification('success');
      setOpenNotification(true);
      if (onConfirm) onConfirm(createdBookingData, selectedItems);
      onClose();
      if (createdBookingData?._id) {
        navigate(`/booking-success/${createdBookingData._id}`, { state: { bookingData: createdBookingData } });
      } else {
        navigate('/booking-history');
      }
    }}
  />
)}
        </DialogActions>
      </Dialog>
      <NotificationSnackbar
        open={openNotification}
        setOpen={setOpenNotification}
        message={messageNotification}
        severity={severityNotification}
      />
    </React.Fragment>
  );
}