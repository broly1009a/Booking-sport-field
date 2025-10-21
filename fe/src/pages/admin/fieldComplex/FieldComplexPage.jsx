import React, { useEffect, useState, useMemo } from 'react';
import { fieldComplexService } from '../../../services/api/fieldComplexService';
import FieldComplexForm from './components/FieldComplexForm';
import FieldComplexList from './components/FieldComplexList';
import Modal from './components/Modal';
import SearchFilter from './components/SearchFilter';
import Pagination from './components/Pagination';


export default function FieldComplexPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    location: '', 
    description: '', 
    images: [], 
    owner: '',
    coordinates: {
      latitude: null,
      longitude: null
    }
  });
  const [editId, setEditId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter states
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await fieldComplexService.getAll();
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let submitData = { ...form };
      if (imageFiles.length > 0) {
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        imageFiles.forEach(file => formData.append('images', file));
        if (editId) {
          await fieldComplexService.update(editId, formData);
        } else {
          await fieldComplexService.create(formData);
        }
      } else {
        if (editId) {
          await fieldComplexService.update(editId, submitData);
        } else {
          await fieldComplexService.create(submitData);
        }
      }
      setForm({
        name: '',
        location: '',
        description: '',
        images: [],
        owner: '',
        coordinates: {
          latitude: null,
          longitude: null
        }
      });
      setEditId(null);
      setImageFiles([]);
      fetchList();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, newStatus) => {
    setLoading(true);
    try {
      await fieldComplexService.update(id, { isActive: newStatus });
      fetchList();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || '',
      location: item.location || '',
      description: item.description || '',
      images: item.images || [],
      owner: item.owner || '',
      coordinates: item.coordinates || {
        latitude: null,
        longitude: null
      }
    });
    setEditId(item._id);
    setImageFiles([]);
  };

  // Filter and pagination logic
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Cụm Sân</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Thêm cụm sân mới
        </button>
      </div>

      <SearchFilter
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setForm({
            name: '',
            location: '',
            description: '',
            images: [],
            owner: '',
            coordinates: {
              latitude: null,
              longitude: null
            }
          });
          setEditId(null);
          setImageFiles([]);
        }}
        title={editId ? 'Chỉnh sửa cụm sân' : 'Thêm cụm sân mới'}
      >
        <FieldComplexForm
          form={form}
          setForm={setForm}
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
          editId={editId}
          setEditId={setEditId}
          onSubmit={(e) => {
            handleSubmit(e);
            setIsModalOpen(false);
          }}
          loading={loading}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <FieldComplexList
        list={paginatedList}
        onEdit={(item) => {
          handleEdit(item);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        loading={loading}
      />

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
    </div>
  );
}