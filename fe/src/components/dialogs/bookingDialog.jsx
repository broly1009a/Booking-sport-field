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
import bookingService from '../../services/api/bookingService';
import { walletService } from '../../services/api/walletService';
import { useNavigate } from 'react-router-dom';

export default function BookingDialog({ open, onClose, selectedSlots, sportField, userId, onConfirm }) {
  console.log('BookingDialog props:', sportField);
  const [note, setNote] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [openNotification, setOpenNotification] = useState(false);
  const [messageNotification, setMessageNotification] = useState('');
  const [severityNotification, setSeverityNotification] = useState('info');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();
  const [openConfirmWallet, setOpenConfirmWallet] = useState(false);

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
      const totalPrice = calculateTotal(); // Tính tổng cả sân và items
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
      // console.log('Rendering BookingDialog with props:', bookingData);
      // Gọi API thanh toán online
      const res = await paymentService.createBookingAndPayment(bookingData);
      // console.log('Payment response:', res?.data?.vnpUrl);
      // console.log('Payment response res:', res);
      // console.log('Payment response res vnp:', res?.vnpUrl);

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
      const totalPrice = calculateTotal();

      // Kiểm tra số dư ví trước khi tạo booking
      try {
        const walletRes = await walletService.getWallet(userId);
        const currentBalance = walletRes?.wallet?.balance || 0;

        if (currentBalance < totalPrice) {
          const shortage = totalPrice - currentBalance;
          setMessageNotification(
            `Số dư ví không đủ! Cần thêm ${shortage.toLocaleString()}đ. Vui lòng nạp tiền vào ví.`
          );
          setSeverityNotification('warning');
          setOpenNotification(true);
          setLoading(false);
          return;
        }
      } catch (walletError) {
        setMessageNotification('Không thể kiểm tra số dư ví!');
        setSeverityNotification('error');
        setOpenNotification(true);
        setLoading(false);
        return;
      }

      const sortedSlots = [...selectedSlots].sort((a, b) => new Date(a.time) - new Date(b.time));
      const startTime = dayjs(sortedSlots[0].time).add(7, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
      const endTime = dayjs(sortedSlots[sortedSlots.length - 1].time).add(7 + 0.5, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
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
        items,
        paymentUrlExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 phút cho wallet payment
      };

      // Tạo booking và thanh toán bằng ví trong 1 bước
      const res = await bookingService.createBooking(bookingData);
      
      if (res?.data?._id) {
        // Thanh toán bằng ví ngay
        try {
          const items = selectedItems
            .filter(item => item.quantity > 0)
            .map(item => ({
              productId: item._id,
              type: item.type,
              name: item.name,
              price: item.pricePerUnit || item.price,
              quantity: item.quantity
            }));
          await paymentService.payBookingByWallet({
            bookingId: res.data._id,
            userId,
            amount: totalPrice,
            items
          });
          setMessageNotification('Đặt sân và thanh toán thành công!');
          setSeverityNotification('success');
          setOpenNotification(true);
          if (onConfirm) onConfirm(res.data, selectedItems);
          onClose();
          // Chuyển sang trang success
          setTimeout(() => {
            navigate(`/booking-success/${res.data._id}`, {state: { bookingData: 
{ ...res.data, selectedItems: selectedItems.filter(item => item.quantity > 0)

  } 
} });
          }, 1000);
        } catch (payError) {
          // Nếu thanh toán thất bại, hủy booking
          await bookingService.updateBooking(res.data._id, { status: 'cancelled' });
          setMessageNotification(payError?.message || 'Thanh toán ví thất bại!');
          setSeverityNotification('error');
          setOpenNotification(true);
        }
      } else {
        setMessageNotification('Tạo booking thất bại!');
        setSeverityNotification('error');
        setOpenNotification(true);
      }
    } catch (error) {
      setMessageNotification(error?.message || 'Đặt sân thất bại!');
      setSeverityNotification('error');
      setOpenNotification(true);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleWalletClick = () => {
    setOpenConfirmWallet(true);
  };

  const handleConfirmWallet = async () => {
    setOpenConfirmWallet(false);
    await handleCreateBooking();
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#388e3c', color: 'white', textAlign: 'center' }}>
          Đặt lịch ngay trực quan
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2, bgcolor: '#e0f2e9', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: '#388e3c', mb: 2 }}>Thông tin sân</Typography>

            {/* Phần hiển thị ảnh */}
            {sportField.images && sportField.images.length > 0 && (
              <Box sx={{ mb: 2, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                <img
                  src={sportField.images[0]}
                  alt={sportField.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1560272564-c83b66b1ad12";
                  }}
                />
                {sportField.images.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                  >
                    +{sportField.images.length - 1} ảnh
                  </Box>
                )}
              </Box>
            )}

            {/* Phần thông tin chi tiết */}
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography><strong>Tên sân:</strong> {sportField.name}</Typography>
              <Typography><strong>Địa điểm:</strong> {sportField.location}</Typography>
              <Typography><strong>Sức chứa:</strong> {sportField.capacity} người</Typography>
              <Typography>
                <strong>Tiện ích:</strong>{' '}
                {sportField.amenities?.map(amenity => {
                  switch (amenity) {
                    case 'parking': return 'Bãi đỗ xe';
                    case 'showers': return 'Phòng tắm';
                    case 'wifi': return 'Wifi';
                    case 'restrooms': return 'Nhà vệ sinh';
                    case 'seating': return 'Chỗ ngồi';
                    default: return amenity;
                  }
                }).join(', ')}
              </Typography>
            </Box>
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

          <Typography sx={{ fontWeight: 'bold', color: '#388e3c', fontSize: '1.2rem' }}>
            Tổng cộng: {calculateTotal().toLocaleString()}đ
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', gap: 1 }}>
          <Button onClick={handleCancel} sx={{ color: '#388e3c' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{ bgcolor: '#ff9800', color: 'white', '&:hover': { bgcolor: '#f57c00' } }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Thanh toán VNPay'}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleWalletClick}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Thanh toán ví'}
          </Button>
              <Dialog open={openConfirmWallet} onClose={() => setOpenConfirmWallet(false)}>
                <DialogTitle>Xác nhận thanh toán bằng ví</DialogTitle>
                <DialogContent>
                  <Typography>Bạn có chắc chắn muốn thanh toán bằng ví với số tiền <strong>{calculateTotal().toLocaleString()}đ</strong>?</Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenConfirmWallet(false)} color="inherit">Hủy</Button>
                  <Button onClick={handleConfirmWallet} color="success" variant="contained">Xác nhận</Button>
                </DialogActions>
              </Dialog>
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