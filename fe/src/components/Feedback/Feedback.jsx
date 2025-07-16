import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Rating } from '@mui/material';
import { feedbackService } from '../../services/api/feedbackService';
import { useAuth } from '../../contexts/authContext';
import ReviewSummary from './ReviewSummary';
import dayjs from 'dayjs';

const Feedback = ({ fieldId }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [updatedRating, setUpdatedRating] = useState(0);
    const [updatedComment, setUpdatedComment] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await feedbackService.getFeedbacksByProduct(fieldId);
                setFeedbacks(response || []);
            } catch (error) {
                console.error('Failed to fetch Feedbacks:', error);
            }
        };
        if (fieldId) fetchFeedbacks();
    }, [fieldId]);

    const handleUpdateFeedback = async () => {
        try {
            await feedbackService.updateFeedback(selectedFeedback._id, { rating: updatedRating, comment: updatedComment });
            const response = await feedbackService.getFeedbacksByProduct(fieldId);
            setFeedbacks(response || []);
            setOpenUpdateDialog(false);
        } catch (error) {
            console.error('Failed to update Feedback:', error);
        }
    };

    const handleDeleteFeedback = async () => {
        try {
            await feedbackService.deleteFeedback(selectedFeedback._id);
            const response = await feedbackService.getFeedbacksByProduct(fieldId);
            setFeedbacks(response || []);
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Failed to delete Feedback:', error);
        }
    };

    const openUpdateDialogForFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setUpdatedRating(feedback.rating);
        setUpdatedComment(feedback.comment);
        setOpenUpdateDialog(true);
    };

    const openDeleteDialogForFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setOpenDeleteDialog(true);
    };

    return (
        <Box>
            <ReviewSummary fieldId={fieldId} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, mt: 5 }}>Customer Reviews</Typography>
            <div className="space-y-6">
                {feedbacks.length === 0 && (
                    <Typography color="text.secondary">Chưa có đánh giá nào</Typography>
                )}
                {feedbacks.map((fb, index) => (
                    <div key={fb._id || index} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-lg">
                                {fb.userId?.fullName || fb.userId?.fname + ' ' + fb.userId?.lname || 'Ẩn danh'}
                            </span>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-xl ${i < fb.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-2">{fb.comment}</p>
                        <span className="text-sm text-gray-500">{dayjs(fb.createdAt).format('YYYY-MM-DD')}</span>
                        {currentUser?._id === (fb.userId?._id || fb.userId) && (
                            <div className="mt-2 flex gap-2">
                                <Button size="small" variant="outlined" onClick={() => openUpdateDialogForFeedback(fb)}>Sửa</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => openDeleteDialogForFeedback(fb)}>Xóa</Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* Update Feedback Dialog */}
            <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)}>
                <DialogTitle>Cập nhật đánh giá</DialogTitle>
                <DialogContent>
                    <Rating
                        name="updated-rating"
                        value={updatedRating}
                        onChange={(event, newValue) => setUpdatedRating(newValue)}
                    />
                    <TextField
                        margin="dense"
                        label="Bình luận"
                        type="text"
                        fullWidth
                        value={updatedComment}
                        onChange={(e) => setUpdatedComment(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpdateDialog(false)}>Hủy</Button>
                    <Button onClick={handleUpdateFeedback}>Cập nhật</Button>
                </DialogActions>
            </Dialog>
            {/* Delete Feedback Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Xóa đánh giá</DialogTitle>
                <DialogContent>
                    <DialogContentText>Bạn có chắc chắn muốn xóa đánh giá này?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
                    <Button onClick={handleDeleteFeedback}>Xóa</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Feedback;