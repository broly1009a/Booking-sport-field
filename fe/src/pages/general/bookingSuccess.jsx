import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { formatBookingTimeUTC } from '../../utils/handleFormat';
import MatchmakingDialog from '../../components/dialogs/matchmakingDialog';
import { useAuth } from '../../contexts/authContext';
import consumablePurchaseService from '../../services/api/consumablePurchaseService';
import equipmentRentalService from '../../services/api/equipmentRentalController';
const fakeBookingData = {
  _id: 'booking123',
  fieldName: 'Sân A - Pickleball',
  startTime: '2025-06-12T08:00:00.000Z',
  endTime: '2025-06-12T10:00:00.000Z',
  totalPrice: 200000,
  customerName: 'Nguyễn Văn A',
  phoneNumber: '912345678',
  note: 'Đặt sân cho nhóm sinh viên'
};
const fakeSelectedItems = [
  { _id: 'item1', name: 'Bóng Pickleball', type: 'equipment', price: 50000, quantity: 2 },
  { _id: 'item2', name: 'Vợt Pickleball', type: 'equipment', price: 200000, quantity: 1 },
  { _id: 'item3', name: 'Nước suối', type: 'consumable', price: 10000, quantity: 3 },
  { _id: 'item4', name: 'Nước tăng lực', type: 'consumable', price: 20000, quantity: 0 }
];

// Fake data for equipment and consumables
const fakeItems = [
  { _id: 'item1', name: 'Bóng Pickleball', type: 'equipment', price: 50000 },
  { _id: 'item2', name: 'Vợt Pickleball', type: 'equipment', price: 200000 },
  { _id: 'item3', name: 'Nước suối', type: 'consumable', price: 10000 },
  { _id: 'item4', name: 'Nước tăng lực', type: 'consumable', price: 20000 }
];

const BookingSuccess = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { selectedItems: initialItems = [] } = location.state || {};
  const [openAddItemsDialog, setOpenAddItemsDialog] = useState(false);
  const [openMatchingQuestion, setOpenMatchingQuestion] = useState(true);
  const [openMatchmakingDialog, setOpenMatchmakingDialog] = useState(false);
  //   const [selectedItems, setSelectedItems] = useState(
  //     initialItems.length > 0
  //       ? initialItems
  //       : fakeItems.map(item => ({ ...item, quantity: 0 }))
  //   );
  const [selectedItems, setSelectedItems] = useState(
    initialItems.length > 0
      ? initialItems
      : fakeSelectedItems // Dùng fake data nếu không có
  );

  const [bookingData, setBookingData] = useState(
    location.state?.bookingData || fakeBookingData
    // Dùng fake data nếu không có
  );
  useEffect(() => {
    // Mở popup nếu chưa có mục nào được chọn
    if (!selectedItems.some(item => item.quantity > 0)) {
      setOpenAddItemsDialog(true);
    }
  }, [selectedItems]);
  useEffect(() => {
    setOpenMatchingQuestion(true);
  }, []);
  const handleQuantityChange = (itemId, delta) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item._id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

 const handleConfirmItems = async () => {
  const itemsToOrder = selectedItems.filter(item => item.quantity > 0);
  if (itemsToOrder.length === 0) {
    toast.warn('Vui lòng chọn ít nhất một món hàng');
    return;
  }

  const equipmentItems = itemsToOrder.filter(item => item.type === 'equipment');
  const consumableItems = itemsToOrder.filter(item => item.type === 'consumable');

  try {
    if (equipmentItems.length > 0) {
      await equipmentRentalService.createEquipmentRental({
        userId: currentUser?._id,
        bookingId: bookingData._id,
        equipments: equipmentItems.map(item => ({
          equipmentId: item._id,
          quantity: item.quantity
        })),
        totalPrice: equipmentItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      });
    }

    if (consumableItems.length > 0) {
      await consumablePurchaseService.createConsumablePurchase({
        userId: currentUser?._id,
        bookingId: bookingData._id,
        consumables: consumableItems.map(item => ({
          consumableId: item._id,
          quantity: item.quantity
        })),
        totalPrice: consumableItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      });
    }

    toast.success('Đặt hàng thiết bị và đồ tiêu thụ thành công');
    setOpenAddItemsDialog(false);
  } catch (error) {
    console.error('Error creating item order:', error);
    toast.error('Đặt hàng thất bại');
  }
};

  const totalItemPrice = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!bookingData) {
    return <Typography>Không có dữ liệu đặt sân</Typography>;
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5' }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#388e3c' }}>
        Đặt sân thành công
      </Typography>
      <Box sx={{ mb: 2, bgcolor: '#e0f2e9', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" sx={{ color: '#388e3c' }}>Thông tin đặt sân</Typography>
        <Typography>Sân: {bookingData.fieldName}</Typography>
        <Typography>
        Thời gian: {formatBookingTimeUTC(bookingData.startTime)} - {formatBookingTimeUTC(bookingData.endTime)}
        </Typography>
        <Typography>Tổng tiền sân: {bookingData.totalPrice.toLocaleString()}đ</Typography>
        <Typography>Tên người đặt: {bookingData.customerName}</Typography>
        <Typography>Số điện thoại: +84{bookingData.phoneNumber}</Typography>
        {bookingData.note && <Typography>Ghi chú: {bookingData.note}</Typography>}
      </Box>

      {selectedItems.some(item => item.quantity > 0) && (
        <Box sx={{ mb: 2, bgcolor: '#e0f2e9', p: 2, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: '#388e3c' }}>Thiết bị/Đồ tiêu thụ đã chọn</Typography>
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
              {selectedItems
                .filter(item => item.quantity > 0)
                .map(item => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type === 'equipment' ? 'Thiết bị' : 'Đồ tiêu thụ'}</TableCell>
                    <TableCell>{item.price.toLocaleString()}đ</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{(item.price * item.quantity).toLocaleString()}đ</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <Typography sx={{ mt: 1, fontWeight: 'bold' }}>
            Tổng tiền thiết bị/đồ tiêu thụ: {totalItemPrice.toLocaleString()}đ
          </Typography>
        </Box>
      )}

      <Typography sx={{ mb: 2, fontWeight: 'bold', color: '#388e3c' }}>
        Tổng cộng: {(bookingData.totalPrice + totalItemPrice).toLocaleString()}đ
      </Typography>

      {/* <Button
        variant="contained"
        sx={{ mt: 2, bgcolor: '#388e3c', '&:hover': { bgcolor: '#2e7d32' } }}
        onClick={() => setOpenAddItemsDialog(true)}
      >
        Thêm thiết bị/đồ tiêu thụ
      </Button> */}
      {/* Trở về trang chủ */}
      <Button
        variant="contained"
        sx={{ mt: 2, bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' }, mr: 2 }}
        onClick={() => window.location.href = '/'}
      >
        Trở về trang chủ
      </Button>
      <Button
        variant="contained"
        sx={{ mt: 2, bgcolor: '#388e3c', '&:hover': { bgcolor: '#2e7d32' } }}
        onClick={() => setOpenMatchingQuestion(true)}
      >
        Ghép trận
      </Button>
      {/* hiển thị text bên dưới Bạn đang tìm đối thủ để chơi? Ghép trận ngay! */}
      <Typography sx={{ mt: 2, color: '#1976d2', cursor: 'pointer' }}>
        Bạn đang tìm đối thủ để chơi? Ghép trận ngay!
      </Typography>
      <MatchmakingDialog
        open={openAddItemsDialog}
        onClose={() => setOpenAddItemsDialog(false)}
        userId={currentUser?._id}
      />
      <Dialog
        open={openAddItemsDialog}
        onClose={() => setOpenAddItemsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thuê thêm thiết bị hoặc mua đồ tiêu thụ</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Bạn muốn thuê thêm thiết bị hoặc mua nước không?
          </Typography>
          <Table sx={{ bgcolor: 'white', border: '1px solid #e0e0e0' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3f2fd' }}>
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
                  <TableCell>{item.price.toLocaleString()}đ</TableCell>
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
                  <TableCell>{(item.price * item.quantity).toLocaleString()}đ</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
            Tổng tiền: {totalItemPrice.toLocaleString()}đ
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenAddItemsDialog(false)}
            sx={{ color: '#f44336' }}
          >
            Bỏ qua
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#388e3c', '&:hover': { bgcolor: '#2e7d32' } }}
            onClick={handleConfirmItems}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openMatchingQuestion} onClose={() => setOpenMatchingQuestion(false)}>
        <DialogTitle>Bạn có muốn ghép trận không?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenMatchingQuestion(false)} color="inherit">
            Không
          </Button>
          <Button
            onClick={() => {
              setOpenMatchingQuestion(false);
              setOpenMatchmakingDialog(true);
            }}
            variant="contained"
            color="primary"
          >
            Có
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog ghép trận */}
      <MatchmakingDialog
        open={openMatchmakingDialog}
        onClose={() => setOpenMatchmakingDialog(false)}
        userId={currentUser?._id}
        bookingId={bookingData._id}
      />
    </Box>
  );
};

export default BookingSuccess;