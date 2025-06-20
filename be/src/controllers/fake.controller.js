const { User, Type, SportField } = require('../models');
const bookingModel = require('../models/booking.model');
const matchmakingModel = require('../models/matchmaking.model');
const mongoose = require('mongoose');

class FakeController {
    async generateAllFakeData(req, res, next) {
        try {
            // 1. Lấy user có sẵn
            const users = await User.find();
            if (users.length < 3) {
                return res.status(400).json({ message: 'Cần ít nhất 3 user để fake data.' });
            }

            // 2. Tạo Type
            const typeNames = ['Sân bóng đá', 'Sân cầu lông', 'Sân tennis'];
            const types = [];
            for (let i = 0; i < typeNames.length; i++) {
                const type = await Type.create({
                    name: typeNames[i],
                    description: `Mô tả cho ${typeNames[i]}`,
                    thumbnails: ''
                });
                types.push(type);
            }

            // 3. Tạo SportField
            const sportFields = [];
            for (let i = 0; i < 5; i++) {
                const field = await SportField.create({
                    name: `Sân số ${i + 1}`,
                    type: types[i % types.length]._id,
                    location: `Khu vực ${i + 1}`,
                    capacity: 10 + i,
                    status: 'available',
                    pricePerHour: 100000 + i * 50000,
                    amenities: ['wifi', 'parking'],
                    images: [],
                });
                sportFields.push(field);
            }

            // 4. Tạo Booking
            const now = new Date();
            const bookings = [];
            for (let i = 0; i < 10; i++) {
                const start = new Date(now.getTime() + i * 60 * 60 * 1000);
                const end = new Date(start.getTime() + 30 * 60 * 1000);
                const booking = await bookingModel.create({
                    userId: users[i % users.length]._id,
                    fieldId: sportFields[i % sportFields.length]._id,
                    startTime: start,
                    endTime: end,
                    status: 'pending',
                    totalPrice: 100000 + i * 10000,
                    participants: [users[(i + 1) % users.length]._id, users[(i + 2) % users.length]._id]
                });
                bookings.push(booking);
            }

            // 5. Tạo Matchmaking
            const matchmakings = [];
            for (let i = 0; i < 10; i++) {
                const matchmaking = await matchmakingModel.create({
                    bookingId: bookings[i % bookings.length]._id,
                    userId: users[i % users.length]._id,
                    requiredPlayers: 5,
                    joinedPlayers: [users[(i + 1) % users.length]._id],
                    status: 'open'
                });
                matchmakings.push(matchmaking);
            }

            res.status(201).json({
                message: 'Fake data created!',
                users: users.length,
                types: types.length,
                sportFields: sportFields.length,
                bookings: bookings.length,
                matchmakings: matchmakings.length
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FakeController();