const Wallet = require('../models/wallet.model');
const WalletTransaction = require('../models/walletTransaction.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
 const Event = require('../models/event.model');
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
            type: 'payment',
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

    /**
     * Hoàn tiền vào ví cho booking hoặc event
     * @param {String} userId - id người dùng
     * @param {Number} amount - số tiền hoàn
     * @param {String} objectId - id của booking hoặc event
     * @param {String} type - 'booking' hoặc 'event'
     * @param {String} description - mô tả giao dịch
     */
    async refundToWallet(userId, amount, objectId, type = 'booking', description = '') {
        if (amount <= 0) {
            throw { status: 400, message: 'Số tiền hoàn phải lớn hơn 0.' };
        }
        let object, statusValid = false;
        if (type === 'booking') {
            console.log('Checking booking for refund:', objectId);
            object = await Booking.findById(objectId);
            if (!object) throw { status: 404, message: 'Booking không tồn tại.' };
            statusValid = (object.status === 'waiting' || object.status === 'cancelled');
            if (!statusValid) throw { status: 400, message: 'Booking không ở trạng thái chờ hoặc đã bị từ chối.' };
            description = description || 'Hoàn tiền do booking bị từ chối';
        } else if (type === 'event') {
            console.log('Checking event for refund:', objectId);
            object = await Event.findById(objectId);
            if (!object) throw { status: 404, message: 'Event không tồn tại.' };
                if (!description) {
                    // Trường hợp hoàn tiền cho toàn bộ event bị huỷ
                    statusValid = (object.status === 'cancelled');
                    if (!statusValid) throw { status: 400, message: 'Event không ở trạng thái bị huỷ.' };
                    description = 'Hoàn tiền do event bị huỷ';
                }
        } else {
            throw { status: 400, message: 'Loại hoàn tiền không hợp lệ.' };
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
            type: 'refund',
            amount,
            status: 'completed',
            description: `${description} (${type}Id: ${objectId})`,
        });

        // Trừ tiền ví admin khi hoàn tiền cho user

        const adminUser = await User.findOne({ role: 'ADMIN' });
        if (adminUser) {
            let adminWallet = await Wallet.findOne({ userId: adminUser._id });
            if (!adminWallet) {
                adminWallet = await Wallet.create({ userId: adminUser._id, balance: 0 });
            }
            if (adminWallet.balance < amount) {
                // Nếu số dư admin không đủ, có thể throw hoặc chỉ trừ về 0
                adminWallet.balance = 0;
            } else {
                adminWallet.balance -= amount;
            }
            await adminWallet.save();
            await WalletTransaction.create({
                walletId: adminWallet._id,
                userId: adminUser._id,
                type: 'refund',
                amount,
                status: 'completed',
                description: `Trừ tiền hoàn trả cho userId: ${userId} (${type}Id: ${objectId})`,
            });
        }
        return wallet;
    }
}
module.exports = new WalletService();