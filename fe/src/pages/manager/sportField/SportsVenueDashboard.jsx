import React, { useState, useMemo, useEffect, useContext } from "react";
import { FaSort, FaFilter, FaSearch, FaEdit, FaTrash, FaWifi, FaParking, FaShower, FaRestroom, FaChair } from "react-icons/fa";
import { MdSportsSoccer, MdSportsBasketball, MdSportsVolleyball } from "react-icons/md";
import CreateVenue from "./CreateVenue";
import UpdateVenue from "./UpdateVenue";
import sportFieldService from '../../../services/api/sportFieldService';
import typeService from "../../../services/api/typeService";
import { PublicContext } from "../../../contexts/publicContext";
import { toast } from "react-toastify";
const SportsVenueDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const { types, sportFields, setSportFields } = useContext(PublicContext);
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
    return sportFields.filter((venue) => {
      const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || venue.type.name.toLowerCase() === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType, sportFields]);

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
  // console.log("venues", venues);
  // console.log("types", types);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Quản lý sân thể thao</h1>
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
                  <tr key={venue.id} className="hover:bg-gray-50 transition-colors duration-200">
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
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash className="h-5 w-5" />
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
        />

        {/* Dialog cập nhật sân */}
        <UpdateVenue
          open={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
          onUpdate={handleUpdateVenue}
          selectedVenue={selectedVenue}
          types={types}
        />
      </div>
    </div>
  );
};

export default SportsVenueDashboard;