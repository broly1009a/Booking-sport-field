import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { Box, Typography } from "@mui/material";
import { toast } from "react-toastify";

const EQUIPMENT_TYPES = [
  { value: "ball", label: "Bóng" },
  { value: "racket", label: "Vợt" },
  { value: "net", label: "Lưới" },
  { value: "goal", label: "Khung thành" },
];

const STATUS_OPTIONS = [
  { value: "available", label: "Sẵn sàng" },
  { value: "rented", label: "Đã cho thuê" },
  { value: "maintenance", label: "Bảo trì" },
];

const EquipmentFormModel = ({ isOpen, onClose, onSubmit, initialData, sportFields }) => {
  const [form, setForm] = useState({
    name: "",
    type: "ball",
    quantity: 0,
    pricePerUnit: 0,
    status: "available",
    sportField: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        sportField: initialData.sportField?.map(f => f._id || f) || [],
      });
    } else {
      setForm({
        name: "",
        type: "ball",
        quantity: 0,
        pricePerUnit: 0,
        status: "available",
        sportField: [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (event, value) => {
    setForm((prev) => ({ ...prev, sportField: value.map(f => f._id || f) }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.type || form.sportField.length === 0) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    onSubmit(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: 22, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        {initialData ? "Cập nhật thiết bị" : "Thêm thiết bị"}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="name"
            value={form.name}
            onChange={handleChange}
            label="Tên thiết bị"
            fullWidth
            size="small"
            variant="outlined"
          />
          <TextField
            select
            name="type"
            value={form.type}
            onChange={handleChange}
            label="Loại thiết bị"
            fullWidth
            size="small"
            variant="outlined"
          >
            {EQUIPMENT_TYPES.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              label="Số lượng"
              fullWidth
              size="small"
              variant="outlined"
              inputProps={{ min: 0 }}
            />
            <TextField
              name="pricePerUnit"
              type="number"
              value={form.pricePerUnit}
              onChange={handleChange}
              label="Giá mỗi đơn vị"
              fullWidth
              size="small"
              variant="outlined"
              inputProps={{ min: 0 }}
            />
          </Box>
          <TextField
            select
            name="status"
            value={form.status}
            onChange={handleChange}
            label="Trạng thái"
            fullWidth
            size="small"
            variant="outlined"
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
            renderInput={(params) => <TextField {...params} label="Sân áp dụng" size="small" variant="outlined" />}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Lưu ý: Vui lòng kiểm tra kỹ thông tin trước khi lưu.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 2, bgcolor: "#388e3c", color: "white" }}>
          {initialData ? "Cập nhật" : "Tạo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EquipmentFormModel;