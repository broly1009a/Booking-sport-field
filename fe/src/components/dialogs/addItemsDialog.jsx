import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  TextField,
  Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const AddItemsDialog = ({
  open,
  onClose,
  selectedItems,
  handleQuantityChange,
  totalItemPrice,
  onConfirm
}) => (
  <Dialog
    open={open}
    onClose={onClose}
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
        onClick={onClose}
        sx={{ color: '#f44336' }}
      >
        Bỏ qua
      </Button>
      <Button
        variant="contained"
        sx={{ bgcolor: '#388e3c', '&:hover': { bgcolor: '#2e7d32' } }}
        onClick={onConfirm}
      >
        Xác nhận
      </Button>
    </DialogActions>
  </Dialog>
);

export default AddItemsDialog;