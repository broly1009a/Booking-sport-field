import React, { useEffect, useState } from 'react';
import CouponService from '../../../services/api/CouponService';
import CouponForm from './CouponForm';
import CouponTable from './CouponTable';
import Modal from './Modal';
import Pagination from '@mui/material/Pagination';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', minOrderValue: '', maxDiscount: '', expiryDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCoupons();
  }, [page, search]);

  const fetchCoupons = async () => {
    const data = await CouponService.getAllCoupons({ page, pageSize, search });
    setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
    setTotalPages(data.totalPages || 1);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.code.trim()) errors.code = "Mã coupon không được để trống";
    if (!form.value || isNaN(form.value) || Number(form.value) <= 0) errors.value = "Giá trị phải là số dương";
    if (!form.minOrderValue || isNaN(form.minOrderValue) || Number(form.minOrderValue) < 0) errors.minOrderValue = "Đơn tối thiểu phải là số không âm";
    if (form.type === "percent" && Number(form.value) > 100) errors.value = "Phần trăm giảm giá tối đa là 100%";
    if (form.maxDiscount && (isNaN(form.maxDiscount) || Number(form.maxDiscount) < 0)) errors.maxDiscount = "Giảm tối đa phải là số không âm";
    if (form.expiryDate && isNaN(Date.parse(form.expiryDate))) errors.expiryDate = "Ngày hết hạn không hợp lệ";
    return errors;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: undefined });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (editingId) {
      await CouponService.updateCoupon(editingId, form);
      setModalTitle('Cập nhật thành công');
      setModalContent(<div className="text-green-600">Coupon đã được cập nhật!</div>);
    } else {
      await CouponService.createCoupon(form);
      setModalTitle('Thêm mới thành công');
      setModalContent(<div className="text-green-600">Coupon đã được thêm mới!</div>);
    }
    setShowModal(true);
    setForm({ code: '', type: 'percent', value: '', minOrderValue: '', maxDiscount: '', expiryDate: '' });
    setEditingId(null);
    fetchCoupons();
  };

  const handleEdit = coupon => {
    setForm({ ...coupon, expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : '' });
    setEditingId(coupon._id);
    setModalTitle('Chỉnh sửa coupon');
    setShowModal(true);
    setModalContent(null);
  };

  const handleDelete = async id => {
    setModalTitle('Xác nhận xóa');
    setModalContent(
      <div>
        <p>Bạn có chắc chắn muốn xóa coupon này?</p>
        <div className="flex gap-2 mt-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={async () => {
            await CouponService.deleteCoupon(id);
            setShowModal(false);
            setModalContent(<div className='text-green-600'>Đã xóa coupon!</div>);
            setTimeout(() => setModalContent(null), 1500);
            fetchCoupons();
          }}>Xóa</button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowModal(false)}>Hủy</button>
        </div>
      </div>
    );
    setShowModal(true);
  };

  const handleCancel = () => {
    setForm({ code: '', type: 'percent', value: '', minOrderValue: '', maxDiscount: '', expiryDate: '' });
    setEditingId(null);
    setShowModal(false);
    setFormErrors({});
  };

  const handleAddCoupon = () => {
    setForm({ code: '', type: 'percent', value: '', minOrderValue: '', maxDiscount: '', expiryDate: '' });
    setEditingId(null);
    setModalTitle('Thêm mã giảm giá');
    setShowModal(true);
    setModalContent(null);
    setFormErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Quản lý Coupon</h2>
      <div className="flex justify-between mb-4">
        <input
          className="border px-3 py-2 rounded w-1/2"
          placeholder="Tìm kiếm mã coupon"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 duration-200"
          onClick={handleAddCoupon}
        >
          Thêm mã giảm giá
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <CouponTable coupons={coupons} onEdit={handleEdit} onDelete={handleDelete} />
        <div className="flex justify-center mt-4">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </div>
      </div>
      <Modal show={showModal} onClose={handleCancel} title={modalTitle}>
        {(modalTitle === 'Thêm mã giảm giá' || modalTitle === 'Chỉnh sửa coupon') && (
          <CouponForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            editingId={editingId}
            onCancel={handleCancel}
            errors={formErrors}
          />
        )}
        {modalTitle !== 'Thêm mã giảm giá' && modalTitle !== 'Chỉnh sửa coupon' && modalContent}
      </Modal>
    </div>
  );
};

export default CouponManager;