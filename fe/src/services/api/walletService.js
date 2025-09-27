import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const walletService = {
    // Nạp tiền vào ví
    topUpWallet: (topUpData) =>
        handleApiCall(() => api.post('/wallet/topup', topUpData)),
    // Lấy thông tin ví của người dùng
    getWallet: (userId) =>
        handleApiCall(() => api.get(`/wallet/${userId}`)),
    // Trừ tiền từ ví
    deductFromWallet: (deductData) =>
        handleApiCall(() => api.post('/wallet/deduct', deductData)),
    // Lấy lịch sử giao dịch ví
    getWalletTransactions: (userId) =>
        handleApiCall(() => api.get(`/wallet/transactions/${userId}`)),
    // Cập nhật thông tin ví (admin)
    updateWallet: (userId, updateData) =>
        handleApiCall(() => api.put(`/wallet/${userId}`, updateData)),
    // Xóa ví (admin)
    deleteWallet: (userId) =>
        handleApiCall(() => api.delete(`/wallet/${userId}`)),
    // Xóa giao dịch ví (admin)
    deleteTransaction: (transactionId) =>
        handleApiCall(() => api.delete(`/wallet/transaction/${transactionId}`)),
    // Hoàn tiền vào ví khi booking bị từ chối
    refundToWallet: (refundData) =>
        handleApiCall(() => api.post('/wallet/refund', refundData)),
};
