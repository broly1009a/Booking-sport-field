const Wallet = require('../models/wallet.model');
const WalletTransaction = require('../models/walletTransaction.model');

class WalletService {
    // Lấy thông tin ví của người dùng
 async getWallet(userId) {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        return await this.createWallet(userId);
    }
    return wallet;
}
    // Nạp tiền vào ví
    async topUpWallet(userId, amount) {
        if (amount <= 0) {
            throw { status: 400, message: 'Số tiền nạp phải lớn hơn 0.' };
        }
        const wallet = await Wallet.findOneAndUpdate(
            { userId },
            { $inc: { balance: amount } },
            { new: true, upsert: true }
        );
        // Ghi log giao dịch ví
        await WalletTransaction.create({
            walletId: wallet._id,
            userId,
            type: 'topup',
            amount,
            status: 'completed',
            description: `Nạp tiền vào ví`,
        });
        return wallet;
    }

    // Trừ tiền từ ví
    async deductFromWallet(userId, amount, description) {
        if (amount <= 0) {
            throw { status: 400, message: 'Số tiền trừ phải lớn hơn 0.' };
        }
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw { status: 404, message: 'Ví không tồn tại.' };
        }
        if (wallet.balance < amount) {
            throw { status: 400, message: 'Số dư ví không đủ.' };
        }
        wallet.balance -= amount;
        await wallet.save();
        // Ghi log giao dịch ví
        await WalletTransaction.create({
            walletId: wallet._id,
            userId,
            type: 'deduct',
            amount,
            status: 'completed',
            description,
        });
        return wallet;
    }
    // Lấy lịch sử giao dịch ví
   async getTransactionHistory(userId, limit = 10, offset = 0) {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        throw { status: 404, message: 'Ví không tồn tại.' };
    }
    const transactions = await WalletTransaction.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    return transactions;
}
    // Xóa giao dịch ví (chỉ dành cho admin)
    async deleteTransaction(transactionId) {
        const transaction = await WalletTransaction.findByIdAndDelete(transactionId);
        if (!transaction) {
            throw { status: 404, message: 'Giao dịch không tồn tại.' };
        }
        return transaction;
    }
    // Cập nhật thông tin ví (chỉ dành cho admin)
    async updateWallet(userId, data) {
        const wallet = await Wallet.findOneAndUpdate(
            { userId },
            data,
            { new: true }
        );
        if (!wallet) {
            throw { status: 404, message: 'Ví không tồn tại.' };
        }
        return wallet;
    }
    // Xóa ví (chỉ dành cho admin)
    async deleteWallet(userId) {
        const wallet = await Wallet.findOneAndDelete({ userId });
        if (!wallet) {
            throw { status: 404, message: 'Ví không tồn tại.' };
        }
        // Xóa tất cả giao dịch liên quan
        await WalletTransaction.deleteMany({ walletId: wallet._id });
        return wallet;
    }

    // Tạo ví mới cho người dùng (nếu chưa có)
    async createWallet(userId) {
        const wallet = new Wallet({ userId, balance: 0 });
        await wallet.save();
        return wallet;
    }
}
module.exports = new WalletService();