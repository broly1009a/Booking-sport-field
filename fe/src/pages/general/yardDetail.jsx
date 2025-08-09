import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaRestroom, FaParking, FaWifi, FaShower } from "react-icons/fa";
import { MdSecurity, MdSportsSoccer } from "react-icons/md";
import sportFieldService from "../../services/api/sportFieldService";
import { feedbackService } from '../../services/api/feedbackService';
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
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${fieldData?.status === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {fieldData?.status}
                        </span>
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
                            <h3 className="text-xl font-semibold mb-4">Location</h3>
                            <p className="text-gray-600">{fieldData?.location}</p>
                            <div className="mt-4 h-48 bg-gray-200 rounded-lg">Map Placeholder</div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4">Capacity & Pricing</h3>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Maximum Capacity:</span>
                                <span className="font-semibold">{fieldData?.capacity} people</span>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-600">Hourly Rate:</span>
                                <span className="text-2xl font-bold text-green-600">${fieldData?.pricePerHour}</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (fieldData?.type?._id) {
                                        navigate(`/booking/${fieldData.type._id}`);
                                    } else {
                                        alert("Không tìm thấy loại sân!");
                                    }
                                }}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Book Now
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-semibold mb-4">Amenities</h3>
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
                    <h3 className="text-2xl font-semibold mb-6">Similar Fields Nearby</h3>
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