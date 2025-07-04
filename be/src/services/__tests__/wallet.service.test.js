const WalletService = require('../wallet.service');
const Wallet = require('../../models/wallet.model');
const WalletTransaction = require('../../models/walletTransaction.model');

jest.mock('../../models/wallet.model');
jest.mock('../../models/walletTransaction.model');

describe('WalletService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getWallet', () => {
        it('should return wallet if exists', async () => {
            Wallet.findOne.mockResolvedValue({ _id: 'w1' });
            const result = await WalletService.getWallet('u1');
            expect(result).toHaveProperty('_id', 'w1');
        });

        it('should create wallet if not exists', async () => {
            Wallet.findOne.mockResolvedValue(null);
            Wallet.prototype.save = jest.fn().mockResolvedValue();
            const mockWallet = { _id: 'w2', userId: 'u1', balance: 0, save: Wallet.prototype.save };
            Wallet.mockImplementation(() => mockWallet);
            const result = await WalletService.getWallet('u1');
            expect(result).toHaveProperty('userId', 'u1');
        });
    });

    describe('topUpWallet', () => {
        it('should throw if amount <= 0', async () => {
            await expect(WalletService.topUpWallet('u1', 0)).rejects.toMatchObject({ status: 400 });
        });

        it('should top up wallet and create transaction', async () => {
            Wallet.findOneAndUpdate.mockResolvedValue({ _id: 'w1' });
            WalletTransaction.create.mockResolvedValue({ _id: 't1' });
            const result = await WalletService.topUpWallet('u1', 100);
            expect(result).toHaveProperty('_id', 'w1');
            expect(WalletTransaction.create).toHaveBeenCalled();
        });
    });

    describe('deductFromWallet', () => {
        it('should throw if amount <= 0', async () => {
            await expect(WalletService.deductFromWallet('u1', 0, 'desc')).rejects.toMatchObject({ status: 400 });
        });

        it('should throw if wallet not found', async () => {
            Wallet.findOne.mockResolvedValue(null);
            await expect(WalletService.deductFromWallet('u1', 10, 'desc')).rejects.toMatchObject({ status: 404 });
        });

        it('should throw if balance not enough', async () => {
            Wallet.findOne.mockResolvedValue({ _id: 'w1', balance: 5 });
            await expect(WalletService.deductFromWallet('u1', 10, 'desc')).rejects.toMatchObject({ status: 400 });
        });

        it('should deduct and create transaction', async () => {
            const save = jest.fn().mockResolvedValue();
            Wallet.findOne.mockResolvedValue({ _id: 'w1', balance: 100, save });
            WalletTransaction.create.mockResolvedValue({ _id: 't2' });
            const result = await WalletService.deductFromWallet('u1', 10, 'desc');
            expect(result).toHaveProperty('_id', 'w1');
            expect(save).toHaveBeenCalled();
            expect(WalletTransaction.create).toHaveBeenCalled();
        });
    });

    describe('getTransactionHistory', () => {
        it('should throw if wallet not found', async () => {
            Wallet.findOne.mockResolvedValue(null);
            await expect(WalletService.getTransactionHistory('u1')).rejects.toMatchObject({ status: 404 });
        });

        it('should return transactions', async () => {
            Wallet.findOne.mockResolvedValue({ _id: 'w1' });
            WalletTransaction.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ _id: 't1' }])
            });
            const result = await WalletService.getTransactionHistory('u1');
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('deleteTransaction', () => {
        it('should throw if transaction not found', async () => {
            WalletTransaction.findByIdAndDelete.mockResolvedValue(null);
            await expect(WalletService.deleteTransaction('t1')).rejects.toMatchObject({ status: 404 });
        });

        it('should delete and return transaction', async () => {
            WalletTransaction.findByIdAndDelete.mockResolvedValue({ _id: 't1' });
            const result = await WalletService.deleteTransaction('t1');
            expect(result).toHaveProperty('_id', 't1');
        });
    });

    describe('updateWallet', () => {
        it('should throw if wallet not found', async () => {
            Wallet.findOneAndUpdate.mockResolvedValue(null);
            await expect(WalletService.updateWallet('u1', {})).rejects.toMatchObject({ status: 404 });
        });

        it('should update and return wallet', async () => {
            Wallet.findOneAndUpdate.mockResolvedValue({ _id: 'w1', updated: true });
            const result = await WalletService.updateWallet('u1', { balance: 200 });
            expect(result).toHaveProperty('updated', true);
        });
    });

    describe('deleteWallet', () => {
        it('should throw if wallet not found', async () => {
            Wallet.findOneAndDelete.mockResolvedValue(null);
            await expect(WalletService.deleteWallet('u1')).rejects.toMatchObject({ status: 404 });
        });

        it('should delete wallet and related transactions', async () => {
            Wallet.findOneAndDelete.mockResolvedValue({ _id: 'w1' });
            WalletTransaction.deleteMany.mockResolvedValue();
            const result = await WalletService.deleteWallet('u1');
            expect(result).toHaveProperty('_id', 'w1');
            expect(WalletTransaction.deleteMany).toHaveBeenCalledWith({ walletId: 'w1' });
        });
    });

    describe('createWallet', () => {
        it('should create and return new wallet', async () => {
            Wallet.prototype.save = jest.fn().mockResolvedValue();
            const mockWallet = { _id: 'w3', userId: 'u2', balance: 0, save: Wallet.prototype.save };
            Wallet.mockImplementation(() => mockWallet);
            const result = await WalletService.createWallet('u2');
            expect(result).toHaveProperty('userId', 'u2');
        });
    });
});