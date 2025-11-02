import React from 'react';

export default function SearchFilter({ keyword, setKeyword, status, setStatus , ownerFilter, setOwnerFilter, owners }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tìm kiếm
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên hoặc địa chỉ..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="w-full md:w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trạng thái
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>
      {(Array.isArray(owners) ? owners.length > 0 : Object.keys(owners || {}).length > 0)
        && typeof setOwnerFilter === 'function'
        && typeof ownerFilter !== 'undefined' && (
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chủ sân
          </label>
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            {Object.values(owners).map(owner => (
              <option key={owner._id} value={owner._id}>
                {owner.fullName || owner.email || owner.username}
              </option>
            ))}
          </select>
        </div>
      )}
      </div>
  );
}