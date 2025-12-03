import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaRestroom, FaParking, FaWifi, FaShower } from "react-icons/fa";
import { MdSecurity, MdSportsSoccer } from "react-icons/md";
import sportFieldService from "../../services/api/sportFieldService";
// import { feedbackService } from '../../services/api/feedbackService';
import Feedback from '../../components/Feedback/Feedback';
import { useNavigate } from "react-router-dom";
const amenityIcons = {
    restrooms: FaRestroom,
    parking: FaParking,
    wifi: FaWifi,
    showers: FaShower,
    security: MdSecurity,
};
const YardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedTime, setSelectedTime] = useState("");
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [fieldData, setFieldData] = useState(null);
    // Simulating fetching field data based on _id
    useEffect(() => {
        const fetchFieldData = async () => {
            try {
                const response = await sportFieldService.getSportFieldById(id);
                if (response) {
                    setFieldData(response);
                } else {
                    console.error("Field data not found");
                }
            } catch (error) {
                console.error("Error fetching field data:", error);
            }
        };
        fetchFieldData();
    }, [id]);
    console.log("Field Data:", fieldData);
    //   const fieldData = {
    //     type: "Bóng đá",
    //     name: "Soccer Field A1",
    //     status: "Available",
    //     price: 50,
    //     capacity: 2,
    //     location: "123 Sports Complex, District 1, Ho Chi Minh City",
    //     mainImage: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3",
    //     galleryImages: [
    //       "https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3",
    //       "https://images.unsplash.com/photo-1516132006923-6cf348e5dee2?ixlib=rb-4.0.3",
    //       "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3"
    //     ],
    //     amenities: [
    //       { name: "Restrooms", icon: FaRestroom },
    //       { name: "Parking", icon: FaParking },
    //       { name: "WiFi", icon: FaWifi },
    //       { name: "Showers", icon: FaShower },
    //       { name: "Security", icon: MdSecurity }
    //     ]
    //   };

    const timeSlots = [
        "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                                <MdSportsSoccer className="text-green-600" />
                                {fieldData?.type?.name || "Soccer Field"}
                            </h1>
                            <h2 className="text-2xl text-gray-700 mt-2">{fieldData?.name}</h2>
                        </div>
                                                {(() => {
                                                    let statusInfo = { color: "bg-gray-300 text-gray-800", text: "Không xác định" };
                                                    switch (fieldData?.status) {
                                                        case "available":
                                                            statusInfo = { color: "bg-green-500 text-white", text: "Còn trống" };
                                                            break;
                                                        case "unavailable":
                                                            statusInfo = { color: "bg-red-500 text-white", text: "Đã đặt" };
                                                            break;
                                                        case "maintenance":
                                                            statusInfo = { color: "bg-yellow-500 text-white", text: "Đang bảo trì" };
                                                            break;
                                                    }
                                                    return (
                                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                                                            {statusInfo.text}
                                                        </span>
                                                    );
                                                })()}
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    <div className="lg:col-span-8">
                        <div className="relative overflow-hidden rounded-lg shadow-lg">
                            <img
                                src={fieldData?.images && fieldData?.images.length > 0 ? fieldData?.images[0] : "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3"}
                                alt="Main field view"
                                className="w-full h-[500px] object-cover transform transition-transform duration-300 hover:scale-105"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3";
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {fieldData?.images?.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Field view ${index + 1}`}
                                    className="h-24 w-full object-cover rounded-lg shadow-md cursor-pointer hover:opacity-75 transition-opacity"
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3";
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Information Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4">Vị trí</h3>
                            <p className="text-gray-600">{fieldData?.location}</p>
                            <div className="mt-4 h-48 rounded-lg overflow-hidden">
                                <iframe
                                    title="FPT University Hanoi Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5062169040193!2d105.52271427476879!3d21.012421688340503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abc60e7d3f19%3A0x2be9d7d0b5abcbf4!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgSMOgIE7hu5lp!5e0!3m2!1svi!2sus!4v1758140210104!5m2!1svi!2sus"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>

                        {fieldData?.complex && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-4">Thông tin cụm sân</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {fieldData.complex.images && fieldData.complex.images.length > 0 ? (
                                            <img src={fieldData.complex.images[0]} alt={fieldData.complex.name} className="w-12 h-12 rounded object-cover border" />
                                        ) : (
                                            <span className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-400">🏟️</span>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900">{fieldData.complex.name}</p>
                                            <p className="text-sm text-gray-600">{fieldData.complex.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${fieldData.complex.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {fieldData.complex.isActive ? 'Hoạt động' : 'Ẩn'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4">Sức chứa & Giá cả</h3>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Sức chứa tối đa:</span>
                                <span className="font-semibold">{fieldData?.capacity} người</span>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-600">Giá theo giờ:</span>
                                <span className="text-2xl font-bold text-green-600">${fieldData?.pricePerHour}</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (fieldData?.complex) {
                                        navigate(`/booking/${fieldData?.complex}`);
                                    } else {
                                        alert("Không tìm thấy loại sân!");
                                    }
                                }}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Đặt ngay
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4">Tiện nghi</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {fieldData?.amenities?.map((amenity, index) => {
                                    const Icon = amenityIcons[amenity.toLowerCase()];
                                    return (
                                        <div key={index} className="flex items-center space-x-2">
                                            {Icon && <Icon className="text-green-600 text-xl" />}
                                            <span className="text-gray-600 capitalize">{amenity}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mb-8 bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-2xl font-semibold mb-6">Đánh giá khách hàng</h3>
                    {fieldData?._id && (
                        <Feedback fieldId={fieldData._id} />
                    )}
                </div>

                {/* Related Fields Section */}
                <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-6">Các sân tương tự gần đây</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(fieldData?.similarFields || []).map((field, index) => (
                            <div key={field._id || index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <img
                                    src={field.images && field.images.length > 0
                                        ? field.images[0]
                                        : "https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3"}
                                    alt={field.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h4 className="font-semibold text-lg mb-2">{field.name}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-600 font-bold">{field.pricePerHour?.toLocaleString()}đ/hr</span>
                                        {/* Nếu có rating thì hiển thị, không thì bỏ qua */}
                                        {field.rating && (
                                            <span className="flex items-center text-yellow-400">
                                                ★ {field.rating}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Section */}
                {isBookingModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                            <h3 className="text-2xl font-semibold mb-4">Book Your Slot</h3>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {timeSlots.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`p-3 rounded-lg border ${selectedTime === time ? "border-green-600 bg-green-50" : "border-gray-200"}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Booking confirmed for ${selectedTime}`);
                                        setIsBookingModalOpen(false);
                                    }}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    disabled={!selectedTime}
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YardDetail;