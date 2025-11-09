import React from 'react';
import UserService from '../../services/userService';
import FormCoordinates from './FormCoordinates';
import { Autocomplete, TextField, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fieldComplexService } from '../../services/api/fieldComplexService';
import { toast } from 'react-toastify';
export default function FieldComplexForm({
  form,
  setForm,
  imageFiles,
  setImageFiles,
  editId,
  setEditId,
  onSubmit,
  loading,
  onClose,
  availableStaff,
  onStaffUpdate
}) {
  const [showSportFields, setShowSportFields] = React.useState(false);
  const [owners, setOwners] = React.useState({});

  React.useEffect(() => {
    const fetchManagers = async () => {
      try {
        // setLoadingOwners(true);
        const response = await UserService.getPaginatedUsers(1, 100, '', 'MANAGER'); // Lấy tất cả manager
        const managerMap = {};
        response.data.forEach(user => {
          if (user.role === 'MANAGER') {
            managerMap[user._id] = user;
          }
        });
        setOwners(managerMap);
      } catch (err) {
        // setError('Không thể tải danh sách quản lý');
        console.error('Error fetching managers:', err);
      } finally {
        // setLoadingOwners(false);
      }
    };
    fetchManagers();
  }, []);
  const handleChange = (e) => {
    if (e.target.name === 'owner') {
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

      {/* Section thêm và quản lý staff */}
      {editId && (
        <Box className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Quản lý nhân viên</h3>
          
          {/* Autocomplete để thêm staff mới */}
          {availableStaff && availableStaff.length > 0 ? (
            <Autocomplete
              options={availableStaff}
              getOptionLabel={(option) => `${option.fname || ''} ${option.lname || ''} (${option.email || ''})`}
              onChange={async (event, newValue) => {
                if (newValue && form._id) {
                  try {
                    await fieldComplexService.addStaffToFieldComplex(form._id, newValue._id);
                    const updated = await fieldComplexService.getById(form._id);
                    if (updated) {
                      setForm(prev => ({ ...prev, staffs: updated.staffs || [] }));
                      toast.success("Đã thêm nhân viên thành công!");
                    }
                  } catch (error) {
                    toast.error("Không thể thêm nhân viên!");
                  }
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Thêm nhân viên mới" placeholder="Chọn nhân viên để thêm" />
              )}
            />
          ) : (
            <div className="text-gray-500 italic">Không có nhân viên khả dụng để thêm</div>
          )}
        </Box>
      )}

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
        {Array.isArray(form.sportFields) && form.sportFields.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSportFields(v => !v)}
            className="px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50"
          >
            {showSportFields ? 'Ẩn danh sách sân' : 'Xem danh sách sân'}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Đang xử lý...' : editId ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
 {/* Autocomplete để thêm staff mới */}
        {availableStaff && availableStaff.length > 0 && (
          <Autocomplete
            options={availableStaff}
            getOptionLabel={(option) => `${option.fname || ''} ${option.lname || ''} (${option.email || ''})`}
            onChange={async (event, newValue) => {
              if (newValue && form._id) {
                try {
                  await fieldComplexService.addStaffToFieldComplex(form._id, newValue._id);
                  const updated = await fieldComplexService.getById(form._id);
                  if (updated) {
                    setForm(prev => ({ ...prev, staffs: updated.staffs || [] }));
                    toast.success("Đã thêm nhân viên thành công!");
                    // Refresh danh sách available staff
                    onStaffUpdate();
                  }
                } catch (error) {
                  toast.error("Không thể thêm nhân viên!");
                }
              }
            }}
            renderInput={(params) => (
              <TextField {...params} label="Thêm nhân viên mới" placeholder="Chọn nhân viên để thêm" className="mb-4" />
            )}
          />
        )}
      {/* Hiển thị danh sách staff bằng Autocomplete nếu có */}
      {Array.isArray(form.staffs) && form.staffs.length > 0 && (
        <Box className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Danh sách nhân viên</h3>
          <Autocomplete
            multiple
            options={form.staffs}
            getOptionLabel={(option) => `${option.fname || ''} ${option.lname || ''} (${option.email || ''})`}
            value={form.staffs}
            readOnly
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Box key={option._id} sx={{ display: 'flex', alignItems: 'center', mr: 1, mb: 1, p: 0.5, border: '1px solid #ccc', borderRadius: 1, background: '#f9f9f9' }}>
                  <span>{option.fname} {option.lname} ({option.email})</span>
                  <IconButton
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={async () => {
                      if (window.confirm('Bạn có chắc muốn xóa nhân viên này khỏi cụm sân?')) {
                        await fieldComplexService.removeStaffFromFieldComplex(form._id, option._id);
                        const updated = await fieldComplexService.getById(form._id);
                        if (updated) {
                          setForm(prev => ({ ...prev, staffs: updated.staffs || [] }));
                          // Refresh danh sách available staff
                          onStaffUpdate();
                        }
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Nhân viên" placeholder="Nhân viên" />
            )}
          />
        </Box>
      )}
      {showSportFields && Array.isArray(form.sportFields) && form.sportFields.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Danh sách sân trong cụm sân</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên sân</th>
                  {/* <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loại</th> */}
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
                    {/* <td className="px-3 py-2 whitespace-nowrap">{typeof field.type === 'object' ? field.type.name : field.type}</td> */}
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
        </div>
      )}
    </form>
  );
}