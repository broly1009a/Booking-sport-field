
import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const feedbackService = {
    createFeedback: (data) =>
        handleApiCall(() => api.post('/feedback/create_feedback', data)),
    getFeedbacks: () =>
        handleApiCall(() => api.get('/feedback/get_feedbacks')),
    getFeedback: (feedbackId) =>
        handleApiCall(() => api.get(`/feedback/get_feedback/${feedbackId}`)),
    getFeedbacksByProduct: (productId) =>
        handleApiCall(() => api.get(`/feedback/get_feedbacks_by_product/${productId}`)),
    getFeedbacksByUser: (userId) =>
        handleApiCall(() => api.get(`/feedback/get_feedbacks_by_user/${userId}`)),
    updateFeedback: (feedbackId, data) =>
        handleApiCall(() => api.put(`/feedback/update_feedback/${feedbackId}`, data)),
    deleteFeedback: (feedbackId) =>
        handleApiCall(() => api.delete(`/feedback/delete_feedback/${feedbackId}`)),
    getFeedbackSummary: (productId) =>
        handleApiCall(() => api.get(`/feedback/feedback_summary/${productId}`)),
};

