const WalletService = require('../services/wallet.service');

class WalletController {
    // Nạp tiền vào ví
    async topUpWallet(req, res, next) {
        try {
            const { userId, amount } = req.body;
            const wallet = await WalletService.topUpWallet(userId, amount);
            res.status(200).json({ success: true, wallet });
        } catch (error) {
            next(error);
        }
    }

    // Lấy thông tin ví của người dùng
    async getWalletInfo(req, res, next) {
        try {
            const { userId } = req.params;
            const wallet = await WalletService.getWallet(userId);
            res.status(200).json({ success: true, wallet });
        } catch (error) {
            next(error);
        }
    }

    // Trừ tiền từ ví
    async deductFromWallet(req, res, next) {
        try {
            const { userId, amount, description } = req.body;
            const wallet = await WalletService.deductFromWallet(userId, amount, description);
            res.status(200).json({ success: true, wallet });
        } catch (error) {
            next(error);
        }
    }

    // Lấy lịch sử giao dịch ví
    async getTransactionHistory(req, res, next) {
        try {
            const { userId } = req.params;
            const { limit, offset } = req.query;
            const transactions = await WalletService.getTransactionHistory(userId, Number(limit) || 10, Number(offset) || 0);
            res.status(200).json({ success: true, transactions });
        } catch (error) {
            next(error);
        }
    }

    // Xóa giao dịch ví (admin)
    async deleteTransaction(req, res, next) {
        try {
            const { transactionId } = req.params;
            const transaction = await WalletService.deleteTransaction(transactionId);
            res.status(200).json({ success: true, transaction });
        } catch (error) {
            next(error);
        }
    }

    // Cập nhật thông tin ví (admin)
    async updateWallet(req, res, next) {
        try {
            const { userId } = req.params;
            const wallet = await WalletService.updateWallet(userId, req.body);
            res.status(200).json({ success: true, wallet });
        } catch (error) {
            next(error);
        }
    }

    // Xóa ví (admin)
    async deleteWallet(req, res, next) {
        try {
            const { userId } = req.params;
            const wallet = await WalletService.deleteWallet(userId);
            res.status(200).json({ success: true, wallet });
        } catch (error) {
            next(error);
        }
    }

        // Hoàn tiền vào ví khi booking bị từ chối
    async refundToWallet(req, res, next) {
        try {
            const { userId, amount, bookingId, description } = req.body;
            const wallet = await WalletService.refundToWallet(userId, amount, bookingId, description);
            res.status(200).json({ success: true, wallet });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new WalletController();