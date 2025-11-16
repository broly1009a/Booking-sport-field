const Feedback = require('../models/feedback.model');

class FeedbackService {
    async createFeedback({ fieldId, bookingId, userId, rating, comment }) {
        const feedback = new Feedback({ fieldId, bookingId, userId, rating, comment });
        return await feedback.save();
    }

    async getFeedbacks() {
        return await Feedback.find()
            .populate('userId', 'fname lname fullName')
            .populate('fieldId', 'name')
            .lean();
    }

    async getFeedbackById(feedbackId) {
        return await Feedback.findById(feedbackId)
            .populate('userId', 'fname lname fullName')
            .populate('fieldId', 'name')
            .lean();
    }

    async getFeedbacksByProduct(productId) {
        // productId ở đây là fieldId
        return await Feedback.find({ fieldId: productId })
            .populate('userId', 'fname lname fullName')
            .lean();
    }

    async getFeedbacksByUser(userId) {
        return await Feedback.find({ userId })
            .populate('fieldId', 'name')
            .lean();
    }

    async deleteFeedback(feedbackId) {
        return await Feedback.findByIdAndDelete(feedbackId);
    }

    async updateFeedback(feedbackId, { rating, comment }) {
        return await Feedback.findByIdAndUpdate(feedbackId, { rating, comment }, { new: true });
    }

    async getFeedbackSummary(productId) {
        const feedbacks = await Feedback.find({ fieldId: productId }).lean();

        const totalFeedbacks = feedbacks.length;
        const ratingCounts = [0, 0, 0, 0, 0];

        let sumRatings = 0;

        feedbacks.forEach(feedback => {
            const ratingIndex = feedback.rating - 1;
            ratingCounts[ratingIndex]++;
            sumRatings += feedback.rating;
        });

        const averageRating = totalFeedbacks > 0 ? sumRatings / totalFeedbacks : 0;

        const ratingPercentages = ratingCounts.map(count => ({
            count,
            percentage: totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0
        }));

        return {
            averageRating,
            totalFeedbacks,
            ratingPercentages
        };
    }

    async getFeedbackSummaryByComplex(complexId) {
        const SportField = require('../models/sportField.model');
        
        // Lấy tất cả các sân thuộc cụm sân
        const fields = await SportField.find({ complex: complexId, isdeleted: false }).select('_id').lean();
        const fieldIds = fields.map(field => field._id);

        // Lấy tất cả feedback của các sân trong cụm
        const feedbacks = await Feedback.find({ fieldId: { $in: fieldIds } }).lean();

        const totalFeedbacks = feedbacks.length;
        const ratingCounts = [0, 0, 0, 0, 0];
        let sumRatings = 0;

        feedbacks.forEach(feedback => {
            const ratingIndex = feedback.rating - 1;
            ratingCounts[ratingIndex]++;
            sumRatings += feedback.rating;
        });

        const averageRating = totalFeedbacks > 0 ? (sumRatings / totalFeedbacks).toFixed(1) : 0;

        const ratingPercentages = ratingCounts.map((count, index) => ({
            rating: index + 1,
            count,
            percentage: totalFeedbacks > 0 ? ((count / totalFeedbacks) * 100).toFixed(1) : 0
        }));

        return {
            complexId,
            totalFields: fieldIds.length,
            averageRating: parseFloat(averageRating),
            totalFeedbacks,
            ratingPercentages
        };
    }
}

module.exports = new FeedbackService();