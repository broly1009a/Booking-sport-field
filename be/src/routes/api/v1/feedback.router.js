const express = require('express');
const router = express.Router();
const FeedbackController = require('../../../controllers/feedback.controller');

router.post('/create_feedback', FeedbackController.createFeedback);
router.get('/get_feedbacks', FeedbackController.getFeedbacks);
router.get('/get_feedback/:feedbackId', FeedbackController.getFeedback);
router.get('/get_feedbacks_by_product/:productId', FeedbackController.getFeedbacksByProduct);
router.get('/get_feedbacks_by_user/:userId', FeedbackController.getFeedbacksByUser);
router.put('/update_feedback/:feedbackId', FeedbackController.updateFeedback);
router.delete('/delete_feedback/:feedbackId', FeedbackController.deleteFeedback);
router.get('/feedback_summary/:productId', FeedbackController.getFeedbackSummary);

module.exports = router;