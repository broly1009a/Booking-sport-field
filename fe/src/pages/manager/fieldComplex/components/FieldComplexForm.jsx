import React from 'react';
import UserService from '../../../../services/userService';
import FormCoordinates from './FormCoordinates';
export default function FieldComplexForm({
  form,
  setForm,
  imageFiles,
  setImageFiles,
  editId,
  setEditId,
  onSubmit,
  loading,
  onClose
}) {
     const [owners, setOwners] = React.useState({});
  const [loadingOwners, setLoadingOwners] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoadingOwners(true);
        const response = await UserService.getPaginatedUsers(1, 100, '', 'MANAGER'); // Lấy tất cả manager
        const managerMap = {};
        response.data.forEach(user => {
          if (user.role === 'MANAGER') {
            managerMap[user._id] = user;
          }
        });
        setOwners(managerMap);
      } catch (err) {
        setError('Không thể tải danh sách quản lý');
        console.error('Error fetching managers:', err);
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchManagers();
  }, []);
  const handleChange = (e) => {
    if (e.target.name === 'owner') {
      // Nếu là trường owner, lấy thông tin đầy đủ của owner từ owners state
      const selectedOwner = owners[e.target.value];
      setForm({ ...form, owner: selectedOwner });
    } else if (e.target.name.startsWith('coordinates.')) {
      // Xử lý coordinates
      const field = e.target.name.split('.')[1];
      setForm({
        ...form,
        coordinates: {
          ...form.coordinates,
          [field]: e.target.value ? parseFloat(e.target.value) : null
        }
      });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleCancel = () => {
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
    setImageFiles([]);
    setEditId(null);
    onClose();
  };
// console.log('Owners:', owners);
// console.log('Form owner value:', form.owner);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên cụm sân
        </label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Nhập tên cụm sân"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ
        </label>
        <input
          name="location"
          type="text"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Nhập địa chỉ"
        />
      </div>

      <FormCoordinates 
        coordinates={form.coordinates} 
        onCoordinatesChange={(newCoordinates) => {
          setForm({
            ...form,
            coordinates: newCoordinates
          });
        }}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chủ sân
        </label>
        <select
          name="owner"
          value={form.owner?._id || form.owner || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Chọn chủ sân</option>
          {Object.values(owners).map((owner) => (
            <option key={owner._id} value={owner._id}>
              {owner.email} - {owner.fname} {owner.lname}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Nhập mô tả"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hình ảnh
        </label>
        <input
          type="file"
          name="images"
          multiple
          onChange={handleImageChange}
          accept="image/*"
          className="w-full"
        />
        {form.images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Preview ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-md"
              />
            ))}
          </div>
        )}
        {imageFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Đã chọn {imageFiles.length} hình ảnh mới
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Đang xử lý...' : editId ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}