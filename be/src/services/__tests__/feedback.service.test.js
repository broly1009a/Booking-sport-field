const FeedbackService = require('../feedback.service');
const Feedback = require('../../models/feedback.model');

jest.mock('../../models/feedback.model');

describe('FeedbackService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create feedback', async () => {
        const data = { fieldId: 'f1', bookingId: 'b1', userId: 'u1', rating: 5, comment: 'Good' };
        Feedback.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(data)
        }));
        const result = await FeedbackService.createFeedback(data);
        expect(result).toEqual(data);
    });

    it('should get all feedbacks', async () => {
        const feedbacks = [{ comment: 'A' }, { comment: 'B' }];
        Feedback.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(feedbacks)
        });
        const result = await FeedbackService.getFeedbacks();
        expect(result).toEqual(feedbacks);
    });

    it('should get feedback by id', async () => {
        const feedback = { comment: 'A' };
        Feedback.findById.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(feedback)
        });
        const result = await FeedbackService.getFeedbackById('id1');
        expect(result).toEqual(feedback);
    });

    it('should get feedbacks by product', async () => {
        const feedbacks = [{ comment: 'A' }];
        Feedback.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(feedbacks)
        });
        const result = await FeedbackService.getFeedbacksByProduct('f1');
        expect(result).toEqual(feedbacks);
    });

    it('should get feedbacks by user', async () => {
        const feedbacks = [{ comment: 'A' }];
        Feedback.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(feedbacks)
        });
        const result = await FeedbackService.getFeedbacksByUser('u1');
        expect(result).toEqual(feedbacks);
    });

    it('should delete feedback', async () => {
        const deleted = { comment: 'deleted' };
        Feedback.findByIdAndDelete.mockResolvedValue(deleted);
        const result = await FeedbackService.deleteFeedback('id1');
        expect(result).toEqual(deleted);
    });

    it('should update feedback', async () => {
        const updated = { comment: 'updated' };
        Feedback.findByIdAndUpdate.mockResolvedValue(updated);
        const result = await FeedbackService.updateFeedback('id1', { rating: 4, comment: 'updated' });
        expect(result).toEqual(updated);
    });

    it('should get feedback summary', async () => {
        const feedbacks = [
            { rating: 5 }, { rating: 4 }, { rating: 4 }, { rating: 3 }
        ];
        Feedback.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(feedbacks) });
        const result = await FeedbackService.getFeedbackSummary('f1');
        expect(result).toHaveProperty('averageRating');
        expect(result).toHaveProperty('totalFeedbacks', 4);
        expect(result).toHaveProperty('ratingPercentages');
    });
});