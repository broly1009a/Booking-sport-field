import React from 'react';
import FormCoordinates from './FormCoordinates';

export default function FieldComplexDetail({ form }) {
  const [showSportFields, setShowSportFields] = React.useState(false);
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên cụm sân
        </label>
        <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100">
          {form?.name}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ
        </label>
        <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100">
          {form?.location}
        </div>
      </div>

      <FormCoordinates
        coordinates={form?.coordinates}
        readOnly={true}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chủ sân
        </label>
        <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100">
          {form?.owner && typeof form?.owner === 'object' && (form?.owner.email || form?.owner.fname || form?.owner.lname)
            ? <>{form?.owner.email || ''} - {form?.owner.fname || ''} {form?.owner.lname || ''}</>
            : <span className="text-gray-400">Không có thông tin</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 whitespace-pre-line">
          {form?.description}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hình ảnh
        </label>
        {form?.images && form?.images.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {form?.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Preview ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-md"
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-400">Không có hình ảnh</div>
        )}
      </div>

      {/* Nút xem danh sách sân và bảng danh sách sân */}
      {Array.isArray(form?.sportFields) && form.sportFields.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowSportFields(v => !v)}
            className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 mb-2"
          >
            {showSportFields ? 'Ẩn danh sách sân' : 'Xem danh sách sân'}
          </button>
          {showSportFields && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên sân</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sức chứa</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Giá/giờ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tiện ích</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ảnh</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {form.sportFields.map((field) => (
                    <tr key={field._id}>
                      <td className="px-3 py-2 whitespace-nowrap">{field.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{field.location}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{field.capacity}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{field.status}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{field.pricePerHour?.toLocaleString()}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{Array.isArray(field.amenities) ? field.amenities.join(', ') : ''}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {Array.isArray(field.images) && field.images.length > 0 && (
                          <img src={field.images[0]} alt={field.name} className="w-12 h-12 object-cover rounded" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
