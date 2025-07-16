import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Box
} from "@mui/material";

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "ongoing", label: "Đang diễn ra" },
  { value: "completed", label: "Đã kết thúc" }
];

const EventFormModel = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    startTime: "",
    endTime: "",
    status: "upcoming"
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        image: initialData.image || "",
        startTime: initialData.startTime ? initialData.startTime.slice(0, 16) : "",
        endTime: initialData.endTime ? initialData.endTime.slice(0, 16) : "",
        status: initialData.status || "upcoming"
      });
    } else {
      setForm({
        name: "",
        description: "",
        image: "",
        startTime: "",
        endTime: "",
        status: "upcoming"
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.startTime || !form.endTime) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    onSubmit({
      ...form,
      startTime: new Date(form.startTime),
      endTime: new Date(form.endTime)
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: 22, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        {initialData ? "Cập nhật sự kiện" : "Thêm sự kiện"}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="name"
            value={form.name}
            onChange={handleChange}
            label="Tên sự kiện"
            fullWidth
            required
          />
          <TextField
            name="description"
            value={form.description}
            onChange={handleChange}
            label="Mô tả"
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            name="image"
            value={form.image}
            onChange={handleChange}
            label="Link hình ảnh (nếu không nhập sẽ lấy ngẫu nhiên)"
            fullWidth
          />
          <TextField
            name="startTime"
            type="datetime-local"
            value={form.startTime}
            onChange={handleChange}
            label="Thời gian bắt đầu"
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            name="endTime"
            type="datetime-local"
            value={form.endTime}
            onChange={handleChange}
            label="Thời gian kết thúc"
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            select
            name="status"
            value={form.status}
            onChange={handleChange}
            label="Trạng thái"
            fullWidth
          >
            {STATUS_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
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

export default EventFormModel;