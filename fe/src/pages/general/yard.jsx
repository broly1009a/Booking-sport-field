import React, { useState, useContext } from "react";
import {
    FaHeart, FaRegHeart, FaFutbol, FaBasketballBall, FaVolleyballBall, FaSwimmer,
    FaRunning, FaTableTennis, FaRestroom, FaChair,
} from "react-icons/fa";
import { MdSportsTennis, MdOutlineLocalParking, MdShower, MdWifi } from "react-icons/md";
import { GiCricketBat } from "react-icons/gi";
import ReactPaginate from "react-paginate";
import { PublicContext } from "../../contexts/publicContext";
import { useNavigate } from "react-router-dom";
import { favoriteService } from "../../services/api/favoriteService";
import { useAuth } from "../../contexts/authContext";
import { useEffect } from "react";
import { fieldComplexService } from "../../services/api/fieldComplexService";
const Yard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedField, setSelectedField] = useState(null);
    const [priceRange, setPriceRange] = useState([0, 300000]);
    const [currentPage, setCurrentPage] = useState(0);
    const [fieldComplexes, setFieldComplexes] = useState([]);
    const [selectedFieldComplex, setSelectedFieldComplex] = useState("all");
    const { types, sportFields } = useContext(PublicContext);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                if (currentUser?._id) {
                    const res = await favoriteService.getFavorites(currentUser._id);
                    setFavorites(res?.data || []);
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách yêu thích:", err);
            }
        };

        fetchFavorites();
    }, [currentUser]);

    const categories = [
        { id: "all", name: "Tất cả", icon: FaRunning },
        { id: "bóng đá", name: "Bóng đá", icon: FaFutbol },
        { id: "bóng rổ", name: "Bóng rổ", icon: FaBasketballBall },
        { id: "pickleball", name: "Pickleball", icon: FaTableTennis },
        { id: "tennis", name: "Tennis", icon: MdSportsTennis },
        { id: "cầu lông", name: "Cầu lông", icon: GiCricketBat },
    ];

    const filteredFields = sportFields
        .filter(field =>
            (selectedCategory === "all" || field.type?.name?.toLowerCase() === selectedCategory) &&
            field.pricePerHour >= priceRange[0] &&
            field.pricePerHour <= priceRange[1]
        );

    const pageCount = Math.ceil(filteredFields.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentFields = filteredFields.slice(offset, offset + itemsPerPage);

    const getStatusColor = (status) => {
        switch (status) {
            case "available": return { color: "bg-green-500", text: "Còn trống" };
            case "unavailable": return { color: "bg-red-500", text: "Đã đặt" };
            case "maintenance": return { color: "bg-yellow-500", text: "Đang bảo trì" };
            default: return { color: "bg-gray-500", text: "Không xác định" };
        }
    };

    const getAmenityIcon = (amenity) => {
        switch (amenity) {
            case "parking": return <MdOutlineLocalParking className="text-gray-600" />;
            case "showers": return <MdShower className="text-gray-600" />;
            case "wifi": return <MdWifi className="text-gray-600" />;
            case "seating": return <FaRestroom className="text-gray-600" />;
            case "restrooms": return <FaChair className="text-gray-600" />;
            default: return null;
        }
    };

    const toggleFavorite = async (fieldId) => {
        try {
            if (!currentUser?._id) {
                alert("Bạn cần đăng nhập để thực hiện thao tác này.");
                return;
            }
            await favoriteService.toggleFavorite({
                userId: currentUser._id,
                fieldId,
            });
            const res = await favoriteService.getFavorites(currentUser._id);
            setFavorites(res?.data || []);
        }
        catch (err) {
            console.error("Lỗi toggle yêu thích:", err);
        }
    };

    const isFavorite = (fieldId) => {
        return favorites.some(fav => fav.fieldId?._id === fieldId);
    };
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };
    return (
        <div className="min-h-screen bg-gray-100 p-6 flex">
            <div className="w-64 bg-white p-4 rounded-lg shadow-lg mr-6 h-fit sticky top-6">
                <h2 className="text-xl font-bold mb-4">Lọc Sân</h2>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Danh Mục</h3>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center w-full p-2 rounded-lg mb-2 ${selectedCategory === category.id ? "bg-blue-600 text-white" : "hover:bg-blue-50 text-gray-700"}`}
                        >
                            <category.icon className="mr-2" />
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Khoảng Giá (VND/giờ)</h3>
                    <div className="space-y-2">
                        <input
                            type="range"
                            min="0"
                            max="300000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {currentFields.map((field) => (
                        <div
                            key={field.id}
                            onClick={() => setSelectedField(field)}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                        >
                            <div className="relative h-48">
                                <img
                                    src={field.images && field.images.length > 0 ? field.images[0] : "https://images.unsplash.com/photo-1560272564-c83b66b1ad12"}
                                    alt={field.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1560272564-c83b66b1ad12";
                                    }}
                                />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(field.status).color}`}>
                                    {getStatusColor(field.status).text}
                                </div>
                                <div
                                    className="absolute bottom-2 right-2 text-xl cursor-pointer z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(field._id);
                                    }}
                                >
                                    {isFavorite(field._id) ? (
                                        <FaHeart className="text-red-500 hover:scale-110 transition-transform" />
                                    ) : (
                                        <FaRegHeart className="text-white hover:text-red-500 hover:scale-110 transition-transform" />
                                    )}
                                </div>

                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{field.name}</h3>
                                <p className="text-gray-600 mb-2">{field.location}</p>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-gray-600">Sức chứa: {field.capacity}</span>
                                    <span className="text-blue-600 font-bold">{field.pricePerHour} VND/giờ</span>
                                </div>
                                <div className="flex space-x-2">
                                    {field.amenities.map((amenity, index) => (
                                        <div key={index} className="p-2 bg-gray-100 rounded-full">
                                            {getAmenityIcon(amenity)}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/yard-detail/${field._id}`);
                                    }}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <ReactPaginate
                    previousLabel="Previous"
                    nextLabel="Next"
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    containerClassName="flex justify-center items-center space-x-2"
                    previousLinkClassName="px-3 py-2 bg-white rounded-lg hover:bg-gray-50"
                    nextLinkClassName="px-3 py-2 bg-white rounded-lg hover:bg-gray-50"
                    pageLinkClassName="px-3 py-2 bg-white rounded-lg hover:bg-gray-50"
                    activeLinkClassName="bg-blue-600 text-white hover:bg-blue-700"
                    disabledClassName="opacity-50 cursor-not-allowed"
                />

                {selectedField && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="relative h-64">
                                <img
                                    src={selectedField.images && selectedField.images.length > 0 ? selectedField.images[0] : "https://images.unsplash.com/photo-1560272564-c83b66b1ad12"}
                                    alt={selectedField.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => setSelectedField(null)}
                                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedField.name}</h2>
                                <div className="space-y-4">
                                    <p className="text-gray-600">{selectedField.location}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Sức chứa: {selectedField.capacity}</span>
                                        <span className="text-blue-600 font-bold">{selectedField.pricePerHour} VND/giờ</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(selectedField.status).color}`}>
                                            {getStatusColor(selectedField.status).text}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-600">Tiện nghi:</span>
                                        <div className="flex space-x-2">
                                            {selectedField.amenities.map((amenity, index) => (
                                                <div key={index} className="p-2 bg-gray-100 rounded-full">
                                                    {getAmenityIcon(amenity)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Yard;