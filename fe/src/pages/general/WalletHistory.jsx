import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/authContext';
import { walletService } from '../../services/api/walletService';

const typeMap = {
  topup: { label: 'Nạp tiền', color: 'success' },
  payment: { label: 'Thanh toán', color: 'primary' },
  deduct: { label: 'Trừ tiền', color: 'error' },
  deposit: { label: 'Nạp tiền', color: 'success' }
};

const statusMap = {
  completed: { label: 'Hoàn thành', color: 'success' },
  pending: { label: 'Đang xử lý', color: 'warning' },
  failed: { label: 'Thất bại', color: 'error' }
};

export default function WalletHistory() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser?._id) return;
      setLoading(true);
      const res = await walletService.getWalletTransactions(currentUser._id);
      setTransactions(res?.transactions || []);
      setLoading(false);
    };
    fetchTransactions();
  }, [currentUser]);

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#388e3c' }}>
        Lịch sử giao dịch ví
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Thời gian</TableCell>
              <TableCell>Loại giao dịch</TableCell>
              <TableCell>Số tiền</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Bạn chưa có giao dịch nào
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(tx => (
                <TableRow key={tx._id}>
                  <TableCell>{dayjs(tx.createdAt).format('HH:mm DD/MM/YYYY')}</TableCell>
                  <TableCell>
                    <Chip
                      label={typeMap[tx.type]?.label || tx.type}
                      color={typeMap[tx.type]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{tx.amount?.toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[tx.status]?.label || tx.status}
                      color={statusMap[tx.status]?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}