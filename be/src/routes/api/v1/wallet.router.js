const express = require('express');
const router = express.Router();
const WalletController = require('../../../controllers/wallet.controller');

// Nạp tiền vào ví
router.post('/topup', WalletController.topUpWallet);

// Lấy thông tin ví
router.get('/:userId', WalletController.getWalletInfo);

// Trừ tiền từ ví
router.post('/deduct', WalletController.deductFromWallet);

// Lấy lịch sử giao dịch ví
router.get('/transactions/:userId', WalletController.getTransactionHistory);

// Xóa giao dịch ví (admin)
router.delete('/transaction/:transactionId', WalletController.deleteTransaction);

// Cập nhật thông tin ví (admin)
router.put('/:userId', WalletController.updateWallet);

// Xóa ví (admin)
router.delete('/:userId', WalletController.deleteWallet);

// Hoàn tiền vào ví khi booking bị từ chối
router.post('/refund', WalletController.refundToWallet);

module.exports = router;