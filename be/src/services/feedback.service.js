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
}

module.exports = new FeedbackService();