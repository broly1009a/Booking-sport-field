import React from 'react';

const CouponForm = ({ form, onChange, onSubmit, editingId, onCancel }) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-3 bg-white p-4 rounded shadow mb-6 max-w-xl">
    <div className="flex gap-3">
      <input name="code" placeholder="Mã coupon" value={form.code} onChange={onChange} required className="flex-1 border p-2 rounded" />
      <select name="type" value={form.type} onChange={onChange} className="border p-2 rounded">
        <option value="percent">Phần trăm</option>
        <option value="amount">Số tiền</option>
      </select>
    </div>
    <div className="flex gap-3">
      <input name="value" type="number" placeholder="Giá trị" value={form.value} onChange={onChange} required className="flex-1 border p-2 rounded" />
      <input name="minOrderValue" type="number" placeholder="Đơn tối thiểu" value={form.minOrderValue} onChange={onChange} className="flex-1 border p-2 rounded" />
    </div>
    <div className="flex gap-3">
      <input name="maxDiscount" type="number" placeholder="Giảm tối đa" value={form.maxDiscount} onChange={onChange} className="flex-1 border p-2 rounded" />
      <input name="expiryDate" type="date" value={form.expiryDate} onChange={onChange} className="flex-1 border p-2 rounded" />
    </div>
    <div className="flex gap-2 mt-2">
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 duration-200">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
      {editingId && <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 duration-200">Hủy</button>}
    </div>
  </form>
);

export default CouponForm;
