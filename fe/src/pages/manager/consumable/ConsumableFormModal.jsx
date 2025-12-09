import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { toast } from "react-toastify";

const CONSUMABLE_TYPES = [
  { value: "water", label: "Nước" },
  { value: "snack", label: "Snack" },
  { value: "meal", label: "Bữa ăn" },
  { value: "beverage", label: "Đồ uống" },
];

const STATUS_OPTIONS = [
  { value: "available", label: "Còn hàng" },
  { value: "out_of_stock", label: "Hết hàng" },
];

const ConsumableFormModal = ({ isOpen, onClose, onSubmit, initialData, sportFields }) => {
  const [form, setForm] = useState({
    name: "",
    type: "water",
    pricePerUnit: 0,
    quantityInStock: 0,
    status: "available",
    sportField: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(prev => ({
      ...(initialData || {}),
      name: initialData?.name || "",
      type: initialData?.type || "water",
      pricePerUnit: initialData?.pricePerUnit || 0,
      quantityInStock: initialData?.quantityInStock || 0,
      status: initialData?.status || "available",
      sportField: sportFields.map(f => f._id), // Luôn tự động chọn tất cả sân
    }));
  }, [initialData, sportFields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (event, value) => {
    setForm((prev) => ({ ...prev, sportField: value.map(f => f._id || f) }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Tên vật tư không được để trống";
    if (!form.type) newErrors.type = "Vui lòng chọn loại vật tư";
    if (!form.pricePerUnit || isNaN(Number(form.pricePerUnit)) || Number(form.pricePerUnit) <= 0) newErrors.pricePerUnit = "Giá phải là số > 0";
    if (!form.quantityInStock || isNaN(Number(form.quantityInStock)) || Number(form.quantityInStock) < 0) newErrors.quantityInStock = "Số lượng phải là số >= 0";
    if (!form.sportField || form.sportField.length === 0) newErrors.sportField = "Vui lòng chọn ít nhất 1 sân áp dụng";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Cập nhật vật tư tiêu hao" : "Thêm vật tư tiêu hao"}</DialogTitle>
      <DialogContent>
        <TextField
          className="input"
          name="name"
          value={form.name}
          onChange={handleChange}
          label="Tên vật tư"
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          select
          className="input"
          name="type"
          value={form.type}
          onChange={handleChange}
          label="Loại vật tư"
          fullWidth
          margin="normal"
          error={!!errors.type}
          helperText={errors.type}
        >
          {CONSUMABLE_TYPES.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          className="input"
          name="pricePerUnit"
          type="number"
          value={form.pricePerUnit}
          onChange={handleChange}
          label="Giá mỗi đơn vị"
          fullWidth
          margin="normal"
          error={!!errors.pricePerUnit}
          helperText={errors.pricePerUnit}
        />
        <TextField
          className="input"
          name="quantityInStock"
          type="number"
          value={form.quantityInStock}
          onChange={handleChange}
          label="Số lượng tồn kho"
          fullWidth
          margin="normal"
          error={!!errors.quantityInStock}
          helperText={errors.quantityInStock}
        />
        <TextField
          select
          className="input"
          name="status"
          value={form.status}
          onChange={handleChange}
          label="Trạng thái"
          fullWidth
          margin="normal"
        >
          {STATUS_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <Autocomplete
          multiple
          options={sportFields}
          getOptionLabel={(option) => option.name}
          value={sportFields.filter(f => form.sportField.includes(f._id))}
          onChange={handleFieldChange}
          renderInput={(params) => <TextField {...params} label="Sân áp dụng" margin="normal" error={!!errors.sportField} helperText={errors.sportField} />}
          className="input"
        />
        <div className="text-sm text-gray-500 mt-2">
          Mặc định: Áp dụng cho tất cả sân. Bạn có thể bỏ chọn hoặc thêm sân theo nhu cầu.
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">{initialData ? "Cập nhật" : "Tạo"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsumableFormModal;