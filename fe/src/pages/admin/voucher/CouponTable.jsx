import React from 'react';

const CouponTable = ({ coupons, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border rounded shadow">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-2 px-4 border-b">Mã</th>
          <th className="py-2 px-4 border-b">Loại</th>
          <th className="py-2 px-4 border-b">Giá trị</th>
          <th className="py-2 px-4 border-b">Đơn tối thiểu</th>
          <th className="py-2 px-4 border-b">Giảm tối đa</th>
          <th className="py-2 px-4 border-b">Ngày hết hạn</th>
          <th className="py-2 px-4 border-b">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {coupons.map(coupon => (
          <tr key={coupon._id} className="hover:bg-gray-50">
            <td className="py-2 px-4 border-b">{coupon.code}</td>
            <td className="py-2 px-4 border-b">{coupon.type === 'percent' ? 'Phần trăm' : 'Số tiền'}</td>
            <td className="py-2 px-4 border-b">{coupon.value}</td>
            <td className="py-2 px-4 border-b">{coupon.minOrderValue}</td>
            <td className="py-2 px-4 border-b">{coupon.maxDiscount || "Không có"}</td>
            <td className="py-2 px-4 border-b">{coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : ''}</td>
            <td className="py-2 px-4 border-b flex gap-2">
              <button onClick={() => onEdit(coupon)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 duration-200">Sửa</button>
              <button onClick={() => onDelete(coupon._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 duration-200">Xóa</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CouponTable;
