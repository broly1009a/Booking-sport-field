import React, { useState, useMemo, useEffect, useContext } from "react";
import { FaSort, FaFilter, FaSearch, FaEdit, FaTrash, FaWifi, FaParking, FaShower, FaRestroom, FaChair } from "react-icons/fa";
import { MdSportsSoccer, MdSportsBasketball, MdSportsVolleyball, MdEvent } from "react-icons/md";
import CreateVenue from "./CreateVenue";
import UpdateVenue from "./UpdateVenue";
import sportFieldService from '../../../services/api/sportFieldService';
import { PublicContext } from "../../../contexts/publicContext";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../../contexts/authContext';
import { fieldComplexService } from '../../../services/api/fieldComplexService';
const SportsVenueDashboard = () => {
  const { types, sportFields, setSportFields } = useContext(PublicContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterFieldComplex, setFilterFieldComplex] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueToDelete, setVenueToDelete] = useState(null);
  const { currentUser } = useAuth();
  const [fieldComplexes, setFieldComplexes] = useState([]);
  const location = useLocation();
  const { complex, owner } = location.state || {};
  useEffect(() => {
    // Lấy danh sách cụm sân như cũ
    const fetchFieldComplexes = async () => {
      try {
        const response = await fieldComplexService.getAll();
        let complexes = response;
        if (currentUser.role !== 'ADMIN') {
          complexes = response.filter(fc => fc.owner && fc.owner._id === currentUser._id);
        }
        setFieldComplexes(complexes);
      } catch (error) {
        console.error("Error fetching field complexes:", error);
      }
    };
    fetchFieldComplexes();

    // Luôn gọi API lấy danh sách sân theo staff
    const fetchSportFieldsByStaff = async () => {
      if (currentUser?._id) {
        try {
          const res = await sportFieldService.getSportFieldsByOwner(currentUser._id);
          setSportFields(res);
        } catch (error) {
          toast.error("Không thể tải danh sách sân của bạn");
        }
      }
    };
    fetchSportFieldsByStaff();

    const params = new URLSearchParams(location.search);
    const complexId = params.get('complex');
    if (complexId) {
      setFilterFieldComplex(complexId);
    }
  }, [location.search, currentUser, setSportFields]);
  // XÓA
  const handleDeleteVenue = async (venue) => {
    setVenueToDelete(venue);
  };

  const confirmDeleteVenue = async () => {
    if (!venueToDelete) return;
    try {
      await sportFieldService.deleteSportField(venueToDelete._id || venueToDelete.id);
      setSportFields(prev => prev.filter(v => v._id !== (venueToDelete._id || venueToDelete.id) && v.id !== (venueToDelete._id || venueToDelete.id)));
      toast.success("Xóa sân thành công!");
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa!");
    }
    setVenueToDelete(null);
  };

  const cancelDeleteVenue = () => {
    setVenueToDelete(null);
  };
  const navigate = useNavigate();
  const itemsPerPage = 5;
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "booked":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <FaWifi className="text-blue-500" />;
      case "parking":
        return <FaParking className="text-gray-500" />;
      case "showers":
        return <FaShower className="text-cyan-500" />;
      case "restrooms":
        return <FaRestroom className="text-indigo-500" />;
      case "seating":
        return <FaChair className="text-purple-500" />;
      default:
        return null;
    }
  };

  const filteredVenues = useMemo(() => {
    const result = sportFields.filter((venue) => {
      const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || venue.type.name.toLowerCase() === filterType;
      const matchesComplex =
        filterFieldComplex === "all" ||
        (venue.complex &&
          (venue.complex._id === filterFieldComplex ||
            venue.complex === filterFieldComplex));
      return matchesSearch && matchesType && matchesComplex;
    });
    return result;
  }, [searchTerm, filterType, filterFieldComplex, sportFields]);

  const paginatedVenues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVenues.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVenues, currentPage]);

  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);

  // CREATE
  const handleCreateVenue = async (newVenue) => {
    try {
      const { images, ...data } = newVenue;
      const res = await sportFieldService.createSportField(data, images || []);
      if (res && res) {
        setSportFields(prev => [...prev, res]);
        toast.success("Tạo sân mới thành công!");
      }
      setCreateDialogOpen(false);
    }
    catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại!");
      setCreateDialogOpen(false);
    }
  };

  // UPDATE
  const handleUpdateVenue = async (updatedVenue) => {
    try {
      const { _id, images, ...data } = updatedVenue;
      const res = await sportFieldService.updateSportField(_id, data, images || []);
      if (res && res) {
        setSportFields(prev => prev.map(v => v._id === _id ? res : v));
        toast.success("Cập nhật sân thành công!");
      }
      setUpdateDialogOpen(false);
      setSelectedVenue(null);
    }
    catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại!");
      setUpdateDialogOpen(false);
      setSelectedVenue(null);
    }
  };
// console.log("complex:", complex);
// console.log("owner:", owner);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Quản lý sân thể thao</h1>
        {/* Thông tin cụm sân và chủ sân */}
        {complex && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Cụm sân: {complex.name}</h2>
            <p className="text-gray-600">Chủ sân: {owner?.fname} {owner?.lname} | Email: {owner?.email} | SĐT: {owner?.phoneNumber}</p>
          </div>
        )}
        <div className="mb-4 flex justify-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => setCreateDialogOpen(true)}
          >
            Thêm sân
          </button>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sân..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="w-full sm:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại sân</option>
              {types.map((type) => (
                <option key={type._id} value={type.name.toLowerCase()}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              className="w-full sm:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterFieldComplex}
              onChange={(e) => setFilterFieldComplex(e.target.value)}
            >
              <option value="all">Tất cả cụm sân</option>
              {fieldComplexes.map((complex) => (
                <option key={complex._id} value={complex._id}>
                  {complex.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sân</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiện ích</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVenues.map((venue) => (
                  <tr key={venue._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={venue.images && venue.images.length > 0 ? venue.images[0] : ""}
                            alt={venue.name}
                            loading="lazy"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                          <div className="text-sm text-gray-500">{venue.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{venue.type.name}</div>
                      <div className="text-sm text-gray-500">Sức chứa: {venue.capacity}</div>
                      <div className="text-sm text-gray-500">{venue.pricePerHour}vnđ/giờ</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(venue.status)}`}>
                        {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2 items-center">
                        {(venue.amenities.slice(0, 3)).map((amenity, index) => (
                          <div key={index} className="tooltip" title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}>
                            {getAmenityIcon(amenity)}
                          </div>
                        ))}
                        {venue.amenities.length > 3 && (
                          <span className="text-gray-500 font-bold">...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FaEdit className="h-5 w-5"
                            onClick={() => {
                              setSelectedVenue(venue);
                              setUpdateDialogOpen(true);
                            }
                            }
                          />
                        </button>
                        <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteVenue(venue)}>
                          <FaTrash className="h-5 w-5" />
                        </button>
                        {/* Confirm Delete Dialog */}
                        {venueToDelete && (
                          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                              <h2 className="text-lg font-semibold mb-4">Xác nhận xóa sân</h2>
                              <p>Bạn có chắc chắn muốn xóa sân <span className="font-bold">{venueToDelete.name}</span> không?</p>
                              <div className="mt-6 flex justify-end space-x-2">
                                <button
                                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                  onClick={cancelDeleteVenue}
                                >
                                  Hủy
                                </button>
                                <button
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                  onClick={confirmDeleteVenue}
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <button className="text-green-600 hover:text-green-900"
                          onClick={() => {
                            navigate(`/manager/maintenance-schedule/${venue?.complex}`);
                          }}
                        >
                          <MdSportsSoccer className="h-5 w-5" />
                        </button>
                        <button className="text-gray-600 hover:text-green-900"
                          onClick={() => {
                            navigate(`/manager/event-schedule/${venue?.complex}`);
                          }}
                        >
                          <MdEvent className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Tiếp
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredVenues.length)}
                  </span>{" "}
                  của <span className="font-medium">{filteredVenues.length}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Tiếp
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        <CreateVenue
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreate={handleCreateVenue}
          types={types}
          fieldComplexes={fieldComplexes}
        />

        {/* Dialog cập nhật sân */}
        <UpdateVenue
          open={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
          onUpdate={handleUpdateVenue}
          selectedVenue={selectedVenue}
          types={types}
          fieldComplexes={fieldComplexes}
        />
      </div>
    </div>
  );
};

export default SportsVenueDashboard;