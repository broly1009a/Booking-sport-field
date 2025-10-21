

export default function FieldComplexList({ list, loading }) {
  if (loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {list.map((item) => (
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
          {/* {item.owner && (
            <div className="text-sm text-gray-500 mb-3">
              <div>Quản lý: {item.owner.fname} {item.owner.lname}</div>
              <div>Email: {item.owner.email}</div>
              <div>SĐT: {item.owner.phoneNumber}</div>
            </div>
          )} */}
          {/* Ngày tạo */}
          <div className="text-sm text-gray-500 mb-3">Ngày tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
        </div>
      ))}
    </div>
  );
}