const FeedbackService = require('../services/feedback.service');

class FeedbackController {
    async createFeedback(req, res) {
        try {
            const feedback = await FeedbackService.createFeedback(req.body);
            res.status(201).json(feedback);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getFeedbacks(req, res) {
        try {
            const feedbacks = await FeedbackService.getFeedbacks();
            res.status(200).json(feedbacks);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getFeedback(req, res) {
        try {
            const feedback = await FeedbackService.getFeedbackById(req.params.feedbackId);
            res.status(200).json(feedback);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getFeedbacksByProduct(req, res) {
        try {
            const feedbacks = await FeedbackService.getFeedbacksByProduct(req.params.productId);
            res.status(200).json(feedbacks);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getFeedbacksByUser(req, res) {
        try {
            const feedbacks = await FeedbackService.getFeedbacksByUser(req.params.userId);
            res.status(200).json(feedbacks);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async deleteFeedback(req, res) {
        try {
            await FeedbackService.deleteFeedback(req.params.feedbackId);
            res.json({ message: 'Feedback deleted successfully' });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async updateFeedback(req, res) {
        try {
            const feedback = await FeedbackService.updateFeedback(req.params.feedbackId, req.body);
            res.status(200).json(feedback);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getFeedbackSummary(req, res) {
        try {
            const summary = await FeedbackService.getFeedbackSummary(req.params.productId);
            res.status(200).json(summary);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getFeedbackSummaryByComplex(req, res) {
        try {
            const summary = await FeedbackService.getFeedbackSummaryByComplex(req.params.complexId);
            res.status(200).json(summary);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
}

module.exports = new FeedbackController();