import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaUsers, FaFutbol } from "react-icons/fa";
import { MdLocationOn, MdStadium } from "react-icons/md";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import { fieldComplexService } from "../../services/api/fieldComplexService";
import { sportFieldService } from "../../services/api/sportFieldService";
import { toast } from "react-toastify";

const FieldComplexList = () => {
    const navigate = useNavigate();
    const [fieldComplexes, setFieldComplexes] = useState([]);
    const [sportFields, setSportFields] = useState([]);
    const [selectedComplex, setSelectedComplex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [ratingsByComplexId, setRatingsByComplexId] = useState({});
    const itemsPerPage = 9;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [complexRes, fieldsRes] = await Promise.all([
                fieldComplexService.getAll(),
                sportFieldService.getAllSportFields()
            ]);
            setFieldComplexes(complexRes || []);
            setSportFields(fieldsRes || []);

            // Lấy rating cho từng cụm sân
            if (complexRes && complexRes.length > 0) {
                const feedbackService = (await import('../../services/api/feedbackService')).default;
                const ratingPromises = complexRes.map(async (complex) => {
                    try {
                        const feedback = await feedbackService.getFeedbackSummaryByComplex(complex._id);
                        return { id: complex._id, rating: feedback?.averageRating || null };
                    } catch {
                        return { id: complex._id, rating: null };
                    }
                });
                const ratings = await Promise.all(ratingPromises);
                const ratingsMap = {};
                ratings.forEach(({ id, rating }) => {
                    ratingsMap[id] = rating;
                });
                setRatingsByComplexId(ratingsMap);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            toast.error("Không thể tải danh sách cụm sân");
        } finally {
            setLoading(false);
        }
    };

    // Đếm số sân trong mỗi cụm
    const getFieldCount = (complexId) => {
        return sportFields.filter(field => field.complex === complexId).length;
    };

    // Lọc theo tìm kiếm
    const filteredComplexes = fieldComplexes.filter(complex =>
        complex.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complex.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredComplexes.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentComplexes = filteredComplexes.slice(offset, offset + itemsPerPage);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleComplexClick = (complex) => {
        navigate(`/field-complex/${complex._id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Danh Sách Cụm Sân
                    </h1>
                    <p className="text-gray-600">
                        Chọn cụm sân để xem lịch và đặt sân
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center">
                        <MdLocationOn className="text-gray-400 text-2xl mr-3" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm cụm sân theo tên hoặc địa điểm..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="flex-1 outline-none text-gray-700"
                        />
                    </div>
                </div>

                {/* Complex Grid */}
                {currentComplexes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <MdStadium className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            Không tìm thấy cụm sân nào
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {currentComplexes.map((complex) => (
                                <div
                                    key={complex._id}
                                    onClick={() => handleComplexClick(complex)}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1 duration-300"
                                >
                                    <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                                        {complex.images && complex.images.length > 0 ? (
                                            <img
                                                src={complex.images[0]}
                                                alt={complex.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.classList.add('bg-gradient-to-br', 'from-green-400', 'to-blue-500');
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MdStadium className="text-white text-6xl opacity-50" />
                                            </div>
                                        )}
                                        {/* Số sân */}
                                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                                            <FaFutbol className="text-green-600" />
                                            <span className="font-semibold text-gray-700">
                                                {getFieldCount(complex._id)} sân
                                            </span>
                                        </div>
                                        {/* Số sao */}
                                        {typeof ratingsByComplexId[complex._id] === 'number' && (
                                            <div className="absolute top-4 left-4 bg-yellow-400 px-3 py-1 rounded-full text-white text-sm font-semibold shadow-lg flex items-center gap-1">
                                                <span>{ratingsByComplexId[complex._id].toFixed(1)}</span>
                                                <FaFutbol className="text-white" />
                                                <span className="ml-1">★</span>
                                            </div>
                                        )}
                                        {complex.isActive && (
                                            <div className="absolute bottom-4 left-4 bg-green-500 px-3 py-1 rounded-full text-white text-sm font-semibold shadow-lg">
                                                Đang hoạt động
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
                                            {complex.name}
                                        </h3>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-start space-x-2 text-gray-600">
                                                <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-red-500" />
                                                <span className="text-sm line-clamp-2">
                                                    {complex.location}
                                                </span>
                                            </div>

                                            {complex.coordinates?.latitude && complex.coordinates?.longitude && (
                                                <div className="flex items-center space-x-2 text-gray-500 text-xs">
                                                    <MdLocationOn />
                                                    <span>
                                                        {complex.coordinates.latitude.toFixed(4)}, {complex.coordinates.longitude.toFixed(4)}
                                                    </span>
                                                </div>
                                            )}

                                            {complex.staffs && complex.staffs.length > 0 && (
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <FaUsers className="text-blue-500" />
                                                    <span className="text-sm">
                                                        {complex.staffs.length} nhân viên
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {complex.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {complex.description}
                                            </p>
                                        )}

                                        <button
                                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleComplexClick(complex);
                                            }}
                                        >
                                            Xem lịch & Đặt sân
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pageCount > 1 && (
                            <ReactPaginate
                                previousLabel="← Trước"
                                nextLabel="Sau →"
                                pageCount={pageCount}
                                onPageChange={handlePageChange}
                                forcePage={currentPage}
                                containerClassName="flex justify-center items-center space-x-2 mt-8"
                                previousLinkClassName="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 text-gray-700 font-medium shadow"
                                nextLinkClassName="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 text-gray-700 font-medium shadow"
                                pageLinkClassName="px-3 py-2 bg-white rounded-lg hover:bg-gray-50 text-gray-700 shadow"
                                activeLinkClassName="bg-green-600 text-white hover:bg-green-700"
                                disabledClassName="opacity-50 cursor-not-allowed"
                            />
                        )}
                    </>
                )}

                {/* Modal Chi tiết */}
                {selectedComplex && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="relative h-64">
                                {selectedComplex.images && selectedComplex.images.length > 0 ? (
                                    <img
                                        src={selectedComplex.images[0]}
                                        alt={selectedComplex.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                        <MdStadium className="text-white text-8xl opacity-50" />
                                    </div>
                                )}
                                <button
                                    onClick={() => setSelectedComplex(null)}
                                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    {selectedComplex.name}
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <FaMapMarkerAlt className="text-red-500 mt-1" />
                                        <div>
                                            <p className="font-semibold text-gray-700">Địa chỉ</p>
                                            <p className="text-gray-600">{selectedComplex.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <FaFutbol className="text-green-600" />
                                        <div>
                                            <p className="font-semibold text-gray-700">Số lượng sân</p>
                                            <p className="text-gray-600">{getFieldCount(selectedComplex._id)} sân</p>
                                        </div>
                                    </div>

                                    {selectedComplex.description && (
                                        <div>
                                            <p className="font-semibold text-gray-700 mb-2">Mô tả</p>
                                            <p className="text-gray-600">{selectedComplex.description}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setSelectedComplex(null);
                                            handleComplexClick(selectedComplex);
                                        }}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold mt-4"
                                    >
                                        Đặt sân ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FieldComplexList;
