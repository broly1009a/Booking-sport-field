import React, { useEffect, useState, useMemo, useContext } from 'react';
import { fieldComplexService } from '../../../services/api/fieldComplexService';
//import FieldComplexList from '../../../components/fieldComplex/FieldComplexList';
import SearchFilter from '../../../components/fieldComplex/SearchFilter';
import Pagination from '../../../components/fieldComplex/Pagination';
import CreateVenue from '../sportField/CreateVenue';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { PublicContext } from "../../../contexts/publicContext";
import sportFieldService from '../../../services/api/sportFieldService';
import { toast } from 'react-toastify';
function FieldComplex() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateVenue, setShowCreateVenue] = useState(false);
  const [selectedComplex, setSelectedComplex] = useState(null);
  const { types } = useContext(PublicContext);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await fieldComplexService.getAll();
      const complexesForOwner = data.filter(fc => fc.owner._id === currentUser._id);
      setList(complexesForOwner);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredList = useMemo(() => {
    return list.filter(item => {
      const matchesKeyword =
        item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.location.toLowerCase().includes(keyword.toLowerCase());
      const matchesStatus =
        status === 'all' ? true :
          status === 'active' ? item.isActive :
            status === 'inactive' ? !item.isActive : true;
      return matchesKeyword && matchesStatus;
    });
  }, [list, keyword, status]);

  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredList.slice(startIndex, startIndex + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredList.length / pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, status, pageSize]);
  const handleDelete = async (id, newStatus) => {
    setLoading(true);
    try {
      await fieldComplexService.update(id, { isActive: newStatus });
      fetchList();
    } finally {
      setLoading(false);
    }
  };
  const handleCreateVenue = async (newVenue) => {
    try {
      const { images, fieldComplex, ...rest } = newVenue;
      // Đổi fieldComplex thành complex
      const data = { ...rest };
      if (fieldComplex) {
        data.complex = fieldComplex;
      }
      const res = await sportFieldService.createSportField(data, images || []);
      if (res) {
        toast.success("Tạo sân mới thành công!");
        if (selectedComplex && !selectedComplex.isActive) {
          await handleDelete(selectedComplex._id, true);
        }
        if (typeof refreshData === 'function') {
          refreshData();
        }
        // await fetchList();
      }
      setShowCreateVenue(false);
    } catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại!");
      setShowCreateVenue(false);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Các Cụm Sân Của Bạn</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => {
            setSelectedComplex(null);
            setShowCreateVenue(true);
          }}
        >
          Thêm sân
        </button>
      </div>

      <SearchFilter
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
        owners={[]}
        ownerFilter={'all'}
        setOwnerFilter={() => { }}
      />

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {paginatedList.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${item.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {item.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </span>
            </div>
            <div className="text-gray-600 mb-2">
              <i className="fas fa-map-marker-alt mr-1"></i> {item.location}
            </div>
            {item.description && (
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
            )}
            {item.images && item.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {item.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${item.name} - ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
            {item.owner && (
              <div className="text-sm text-gray-500 mb-3">
                <div>Quản lý: {item.owner.fname} {item.owner.lname}</div>
                <div>Email: {item.owner.email}</div>
                <div>SĐT: {item.owner.phoneNumber}</div>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setSelectedComplex(item);
                  setShowCreateVenue(true);
                }}
                disabled={!item.isActive}
              >
                Thêm sân
              </button>
              <button
                className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                onClick={() => navigate(`/manager/sport-field-list?complex=${item._id}`)}
              >
                Xem sân
              </button>
              <button
                className="px-3 py-1 text-sm bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                onClick={() => navigate(`/manager/field-complex-detail/${item._id}`)}
              >
               Chi tiết 
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredList.length}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      )}

      {!loading && filteredList.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy cụm sân nào {keyword && `cho từ khóa "${keyword}"`}
        </div>
      )}

      {/* Modal CreateVenue */}
      {showCreateVenue && (
        <CreateVenue
          open={showCreateVenue}
          onClose={() => { setShowCreateVenue(false); setSelectedComplex(null); }}
          onCreate={async (newVenue) => {
            await handleCreateVenue(newVenue);
            setSelectedComplex(null);
            // fetchList();
          }}
          types={types}
          fieldComplexes={selectedComplex ? [selectedComplex] : list}
        />
      )}
    </div>
  );
}

export default FieldComplex;