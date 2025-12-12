import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Autocomplete,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const initialState = {
  name: "",
  type: "",
  location: "",
  capacity: "",
  status: "available",
  pricePerHour: "",
  amenities: [],
  images: [],
  complex: ""
};

const AMENITIES = [
  { label: "Wifi", value: "wifi" },
  { label: "Parking", value: "parking" },
  { label: "Showers", value: "showers" },
  { label: "Restrooms", value: "restrooms" },
  { label: "Seating", value: "seating" }
];

const TYPES = [
  { label: "Bóng đá", value: "soccer" },
  { label: "Bóng rổ", value: "basketball" },
  { label: "Bóng chuyền", value: "volleyball" }
];

const STATUSES = [
  { label: "Sẵn sàng", value: "available" },
  { label: "Không sẵn sàng", value: "unavailable" }
];

export default function CreateVenue({ open, onClose, onCreate, types, fieldComplexes }) {
  // Validate
  const [errors, setErrors] = useState({});
  // Lấy param complex từ URL nếu có
  const [venueData, setVenueData] = useState(initialState);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (open) {
      const params = new URLSearchParams(window.location.search);
      const complexId = params.get('complex');
      if (complexId && fieldComplexes && fieldComplexes.some(fc => fc._id === complexId)) {
        setVenueData(v => ({ ...v, complex: complexId }));
      } else if (fieldComplexes && fieldComplexes.length === 1) {
        setVenueData(v => ({ ...v, complex: fieldComplexes[0]._id }));
      }
    }
  }, [open, fieldComplexes]);


  const handleChange = (e) => {
    setVenueData({ ...venueData, [e.target.name]: e.target.value });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    console.log("Selected files:", files);
    setVenueData({ ...venueData, images: files });
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleRemoveImage = (index) => {
    const newImages = [...venueData.images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setVenueData({ ...venueData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const validate = () => {
    const newErrors = {};
    if (!venueData.name.trim()) newErrors.name = "Tên sân không được để trống";
    if (!venueData.type) newErrors.type = "Vui lòng chọn loại sân";
    if (!venueData.location.trim()) newErrors.location = "Địa chỉ không được để trống";
    if (!venueData.capacity || isNaN(Number(venueData.capacity)) || Number(venueData.capacity) <= 0) newErrors.capacity = "Sức chứa phải là số > 0";
    if (!venueData.pricePerHour || isNaN(Number(venueData.pricePerHour)) || Number(venueData.pricePerHour) <= 0) newErrors.pricePerHour = "Giá thuê phải là số > 0";
    if (!venueData.complex) newErrors.complex = "Vui lòng chọn cụm sân";
    if (!venueData.images || venueData.images.length === 0) newErrors.images = "Vui lòng tải lên ít nhất 1 hình ảnh";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreate(venueData);
    setVenueData(initialState);
    setImagePreviews([]);
    setErrors({});
    onClose();
  };
// console.log("types", types);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thêm sân thể thao</DialogTitle>
      <DialogContent>
        <InputLabel sx={{ mt: 2 }}>Hình ảnh sân</InputLabel>
        {errors.images && <span style={{color:'red'}}>{errors.images}</span>}
        <Button
          variant="outlined"
          component="label"
          sx={{ mb: 1 }}
        >
          Tải ảnh lên
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleImagesChange}
          />
        </Button>
        <InputLabel sx={{ mt: 2 }}>{venueData.images.length} đã tải lên</InputLabel>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginTop: '10px'
        }}>
          {imagePreviews.map((src, index) => (
            <div key={index} style={{
              position: 'relative',
              width: '100px',
              height: '100px'
            }}>
              <img
                src={src}
                alt={`preview-${index}`}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              <IconButton
                onClick={() => handleRemoveImage(index)}
                size="small"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
        </div>

        <TextField margin="dense" label="Tên sân" name="name" fullWidth value={venueData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
        <InputLabel sx={{ mt: 2 }}>Loại sân</InputLabel>
        <Select name="type" fullWidth value={venueData.type} onChange={handleChange} error={!!errors.type}>
          {types.map((t) => (
            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
          ))}
        </Select>
        {errors.type && <span style={{color:'red'}}>{errors.type}</span>}

        {/* <InputLabel sx={{ mt: 2 }}>Cụm sân</InputLabel>
        {fieldComplexes.length === 1 ? (
          <TextField
            fullWidth
            value={fieldComplexes[0].name}
            disabled
            sx={{ mb: 2 }}
          />
        ) : (
          <Select name="complex" fullWidth value={venueData.fieldComplex || ''} onChange={handleChange}>
            {fieldComplexes.map((fc) => (
              <MenuItem key={fc._id} value={fc._id}>{fc.name}</MenuItem>
            ))}
          </Select>
        )} */}
        
        <InputLabel sx={{ mt: 2 }}>Cụm sân</InputLabel>
        <Select name="complex" fullWidth value={venueData.complex || ''} onChange={handleChange} error={!!errors.complex}>
          {fieldComplexes.map((fc) => (
            <MenuItem key={fc._id} value={fc._id}>{fc.name}</MenuItem>
          ))}
        </Select>
        {errors.complex && <span style={{color:'red'}}>{errors.complex}</span>}
        <TextField margin="dense" label="Địa chỉ cụ thể" name="location" fullWidth value={venueData.location} onChange={handleChange} error={!!errors.location} helperText={errors.location} />
        <TextField margin="dense" label="Sức chứa" name="capacity" fullWidth type="number" value={venueData.capacity} onChange={handleChange} error={!!errors.capacity} helperText={errors.capacity} />
        <InputLabel sx={{ mt: 2 }}>Trạng thái</InputLabel>
        <Select name="status" fullWidth value={venueData.status} onChange={handleChange}>
          {STATUSES.map((s) => (
            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
          ))}
        </Select>
        <TextField margin="dense" label="Giá thuê mỗi giờ" name="pricePerHour" fullWidth type="number" value={venueData.pricePerHour} onChange={handleChange} error={!!errors.pricePerHour} helperText={errors.pricePerHour} />
        <InputLabel sx={{ mt: 2 }}>Tiện ích</InputLabel>
        <Autocomplete
          multiple
          options={AMENITIES}
          getOptionLabel={(option) => option.label}
          value={venueData.amenities.map((a) => AMENITIES.find((o) => o.value === a)).filter(Boolean)}
          onChange={(event, newValue) => {
            setVenueData({
              ...venueData,
              amenities: newValue.map((v) => v.value)
            });
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Chọn tiện ích" />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">Tạo</Button>
      </DialogActions>
    </Dialog>
  );
}