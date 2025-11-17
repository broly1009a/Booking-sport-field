import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaMapMarkerAlt, FaUsers, FaFutbol, FaPhoneAlt,
    FaCalendarAlt, FaUserTie, FaInfoCircle, FaStar
} from "react-icons/fa";
import { MdStadium, MdLocationOn, MdEvent } from "react-icons/md";
import { fieldComplexService } from "../../services/api/fieldComplexService";
import { sportFieldService } from "../../services/api/sportFieldService";
import { toast } from "react-toastify";
import feedbackService from '../../services/api/feedbackService';

const FieldComplexDetail = () => {
        const [showAllFields, setShowAllFields] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const [complexData, setComplexData] = useState(null);
    const [sportFields, setSportFields] = useState([]);
    const [feedbackSummary, setFeedbackSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [complexRes, fieldsRes, feedbackRes] = await Promise.all([
                    fieldComplexService.getById(id),
                    sportFieldService.getAllSportFields(),
                    feedbackService.getFeedbackSummaryByComplex(id)
                ]);

                if (complexRes) {
                    setComplexData(complexRes);
                }

                // Lọc các sân thuộc cụm này
                if (fieldsRes) {
                    const fieldsInComplex = fieldsRes.filter(
                        field => field.complex === id
                    );
                    setSportFields(fieldsInComplex);
                }

                // Set feedback summary
                if (feedbackRes) {
                    setFeedbackSummary(feedbackRes);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                toast.error("Không thể tải thông tin cụm sân");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleBookingClick = () => {
        navigate(`/booking-schedule/${id}`);
    };

    const handleFieldClick = (fieldId) => {
        navigate(`/yard-detail/${fieldId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Đang tải...</div>
            </div>
        );
    }

    if (!complexData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <MdStadium className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Không tìm thấy cụm sân</p>
                    <button
                        onClick={() => navigate("/field-complex")}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                                <MdStadium className="text-green-600" />
                                {complexData.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <FaMapMarkerAlt className="text-red-500" />
                                <span>{complexData.location}</span>
                            </div>
                        </div>
                        {complexData.isActive && (
                            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-500 text-white">
                                Đang hoạt động
                            </span>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    {/* Left Column - Images */}
                    <div className="lg:col-span-8">
                        <div className="relative overflow-hidden rounded-lg shadow-lg mb-4">
                            {complexData.images && complexData.images.length > 0 ? (
                                <img
                                    src={complexData.images[0]}
                                    alt={complexData.name}
                                    className="w-full h-[500px] object-cover transform transition-transform duration-300 hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-[500px] bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                    <MdStadium className="text-white text-9xl opacity-50" />
                                </div>
                            )}
                        </div>

                        {/* Gallery */}
                        {complexData.images && complexData.images.length > 1 && (
                            <div className="grid grid-cols-3 gap-4">
                                {complexData.images.slice(1).map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Complex view ${index + 2}`}
                                        className="h-32 w-full object-cover rounded-lg shadow-md cursor-pointer hover:opacity-75 transition-opacity"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Description Section */}
                        {complexData.description && (
                            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FaInfoCircle className="text-blue-600" />
                                    Mô tả
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {complexData.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Info Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Map & Location */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <MdLocationOn className="text-red-500" />
                                Vị trí
                            </h3>
                            <p className="text-gray-600 mb-4">{complexData.location}</p>

                            {complexData.coordinates?.latitude && complexData.coordinates?.longitude && (
                                <>
                                    <div className="text-sm text-gray-500 mb-3">
                                        Tọa độ: {complexData.coordinates.latitude.toFixed(6)}, {complexData.coordinates.longitude.toFixed(6)}
                                    </div>
                                    <div className="h-48 rounded-lg overflow-hidden">
                                        <iframe
                                            title="Complex Location Map"
                                            src={`https://maps.google.com/maps?q=${complexData.coordinates.latitude},${complexData.coordinates.longitude}&z=15&output=embed`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4">Thông tin chung</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <FaFutbol className="text-green-600" />
                                        Số lượng sân
                                    </span>
                                    <span className="font-semibold text-lg">{sportFields.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <FaUsers className="text-blue-600" />
                                        Nhân viên
                                    </span>
                                    <span className="font-semibold text-lg">
                                        {complexData.staffs?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Booking Button */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <button
                                onClick={handleBookingClick}
                                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
                            >
                                <FaCalendarAlt />
                                Xem lịch & Đặt sân
                            </button>
                        </div>
                        {/* Feedback Summary Card */}
                        {feedbackSummary && feedbackSummary.totalFeedbacks > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FaStar className="text-yellow-500" />
                                    Đánh giá
                                </h3>
                                <div className="space-y-3">
                                    <div className="text-center pb-4 border-b">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="text-4xl font-bold text-gray-900">
                                                {feedbackSummary.averageRating}
                                            </span>
                                            <FaStar className="text-yellow-400 text-3xl" />
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {feedbackSummary.totalFeedbacks} đánh giá
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {feedbackSummary.ratingPercentages.slice().reverse().map((item) => (
                                            <div key={item.rating} className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600 w-8">
                                                    {item.rating} <FaStar className="inline text-yellow-400 text-xs" />
                                                </span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${item.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600 w-12 text-right">
                                                    {item.percentage}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Owner Info */}
                        {complexData.owner && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FaUserTie className="text-purple-600" />
                                    Người quản lý
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Họ tên:</span>
                                        <span className="font-semibold">
                                            {complexData.owner.fname} {complexData.owner.lname}
                                        </span>
                                    </div>
                                    {complexData.owner.phoneNumber && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <FaPhoneAlt className="text-sm" />
                                                Điện thoại:
                                            </span>
                                            <span className="font-semibold">
                                                {complexData.owner.phoneNumber}
                                            </span>
                                        </div>
                                    )}
                                    {complexData.owner.email && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-semibold text-sm">
                                                {complexData.owner.email}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                    </div>
                </div>

                {/* Staff Section */}
                {complexData.staffs && complexData.staffs.length > 0 && (
                    <div className="mb-8 bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <FaUsers className="text-blue-600" />
                            Đội ngũ nhân viên
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {complexData.staffs.map((staff) => (
                                <div
                                    key={staff._id}
                                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {staff.fname?.charAt(0)}{staff.lname?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {staff.fname} {staff.lname}
                                            </h4>
                                            {staff.phoneNumber && (
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <FaPhoneAlt className="text-xs" />
                                                    {staff.phoneNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fields in Complex Section */}
                <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <FaFutbol className="text-green-600" />
                        Các sân trong cụm ({sportFields.length})
                    </h3>
                    {sportFields.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <MdStadium className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Chưa có sân nào trong cụm này</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(showAllFields ? sportFields : sportFields.slice(0, 3)).map((field) => (
                                    <div
                                        key={field._id}
                                        onClick={() => handleFieldClick(field._id)}
                                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:-translate-y-1 duration-300"
                                    >
                                        <div className="relative h-48">
                                            <img
                                                src={
                                                    field.images && field.images.length > 0
                                                        ? field.images[0]
                                                        : "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3"
                                                }
                                                alt={field.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3";
                                                }}
                                            />
                                            {(() => {
                                                let statusInfo = { color: "bg-gray-500", text: "Không xác định" };
                                                switch (field.status) {
                                                    case "available":
                                                        statusInfo = { color: "bg-green-500", text: "Còn trống" };
                                                        break;
                                                    case "booked":
                                                        statusInfo = { color: "bg-red-500", text: "Đã đặt" };
                                                        break;
                                                    case "maintenance":
                                                        statusInfo = { color: "bg-yellow-500", text: "Bảo trì" };
                                                        break;
                                                }
                                                return (
                                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-semibold ${statusInfo.color}`}>
                                                        {statusInfo.text}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-semibold text-lg mb-2 text-gray-900">
                                                {field.name}
                                            </h4>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                                                {field.location}
                                            </p>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-gray-600 text-sm">
                                                    Sức chứa: {field.capacity} người
                                                </span>
                                                <span className="text-green-600 font-bold text-lg">
                                                    {field.pricePerHour?.toLocaleString()}đ/h
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFieldClick(field._id);
                                                }}
                                                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {sportFields.length > 3 && (
                                <div className="flex justify-center mt-6">
                                    {!showAllFields ? (
                                        <button
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                            onClick={() => setShowAllFields(true)}
                                        >
                                            Xem thêm
                                        </button>
                                    ) : (
                                        <button
                                            className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                                            onClick={() => navigate('/yard')}
                                        >
                                            Xem sân khác
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FieldComplexDetail;
