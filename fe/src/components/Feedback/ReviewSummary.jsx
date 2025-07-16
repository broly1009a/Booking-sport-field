import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { feedbackService } from '../../services/api/feedbackService';

const ReviewSummary = ({ fieldId }) => {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await feedbackService.getFeedbackSummary(fieldId);
                setSummary(response);
            } catch (error) {
                console.error('Failed to fetch Feedback summary:', error);
            }
        };
        if (fieldId) fetchSummary();
    }, [fieldId]);

    if (!summary) {
        return <div>Đang tải...</div>;
    }

    return (
        <Box className="mb-8 bg-white rounded-xl shadow-md p-6">
            <Typography className="text-2xl font-semibold mb-4">Tổng quan đánh giá</Typography>
            <Box className="flex items-center mb-2">
                <span className="text-4xl font-bold text-yellow-500">{summary.averageRating?.toFixed(1)}</span>
                <span className="ml-2 flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-2xl ${i < Math.round(summary.averageRating) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                    ))}
                </span>
                <span className="ml-2 text-gray-600">/ 5</span>
            </Box>
            <Typography className="text-gray-600 mb-4">{summary.totalFeedbacks} lượt đánh giá</Typography>
           <div>
    {[5, 4, 3, 2, 1].map((star, idx) => {
        // Đảo ngược: index 0 là 5 sao, index 4 là 1 sao
        const rating = summary.ratingPercentages[star - 1] || { percentage: 0, count: 0 };
        return (
            <Box key={star} className="flex items-center mb-2">
                <span className="w-10 text-gray-700">{star} sao</span>
                <LinearProgress
                    variant="determinate"
                    value={rating.percentage}
                    sx={{
                        flex: 1,
                        height: 10,
                        borderRadius: 5,
                        mx: 2,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            backgroundColor: '#ffb400',
                        },
                    }}
                />
                <span className="w-12 text-right text-gray-500">{Math.round(rating.percentage)}%</span>
                <span className="w-10 text-right text-gray-400 ml-2">({rating.count})</span>
            </Box>
        );
    })}
</div>
        </Box>
    );
};

export default ReviewSummary;