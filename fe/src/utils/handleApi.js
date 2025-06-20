export const handleApiCall = async (apiCall) => {
    try {
        const response = await apiCall();
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error?.message || 'An error occurred');
    }
};