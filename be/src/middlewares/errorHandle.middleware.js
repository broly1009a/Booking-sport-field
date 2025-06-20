class ErrorHandle {
    handleError = (err, req, res, next) => {
        const status = err.statusCode || 500;
        console.log(err?.message);
        return res.status(status).json({
            success: false,
            message: err.message || "Đã xảy ra lỗi",
        });
    };
};

module.exports = new ErrorHandle();