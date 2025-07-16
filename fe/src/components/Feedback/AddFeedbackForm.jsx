import React, { useState } from 'react';
import { TextField, Button, Box, Rating, Typography } from '@mui/material';

import { feedbackService } from '../../services/api/feedbackService';

const AddFeedbackForm = ({userId, bookingId, fieldId, onFeedbackAdded }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

// console.log('AddFeedbackForm', userId, bookingId, fieldId);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newFeedback = { fieldId,bookingId, userId, rating, comment };
             await feedbackService.createFeedback(newFeedback);
            const response = await feedbackService.getFeedbacksByProduct(fieldId);
            onFeedbackAdded(response);
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Failed to add Feedback:', error);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
               <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Feedback</Typography>
            <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                required
                margin="normal"
            />
            <TextField
                label="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                fullWidth
                margin="normal"
            />
            <Button type="submit" variant="contained" color="primary">
                Add Feedback
            </Button>
        </Box>
    );
};

export default AddFeedbackForm;
