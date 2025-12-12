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
  IconButton,
  FormControl,
  FormHelperText
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AMENITIES = [
  { label: "Wifi", value: "wifi" },
  { label: "Parking", value: "parking" },
  { label: "Showers", value: "showers" },
  { label: "Restrooms", value: "restrooms" },
  { label: "Seating", value: "seating" }
];

const TYPES = [
  {
    "_id": "683986b9d3e8aa8bc227fa74",
    "name": "Pickleball",
    "description": "Sân pickleball",
    "thumbnails": "https://ladygolf.vn/wp-content/uploads/2025/04/7.jpg",
    "createdAt": "2025-05-30T10:21:45.987Z",
    "updatedAt": "2025-05-30T10:27:58.997Z",
    "__v": 0
  },
  {
    "_id": "68398859d3e8aa8bc227fa8b",
    "name": "Bóng đá",
    "description": "Sân bóng đá",
    "thumbnails": "https://pos.nvncdn.com/b0b717-26181/art/artCT/20240812_0rmC0gAF.jpg",
    "createdAt": "2025-05-30T10:28:41.596Z",
    "updatedAt": "2025-05-30T10:28:41.596Z",
    "__v": 0
  }
];
const STATUSES = [
  { label: "Sẵn sàng", value: "available" },
  { label: "Không sẵn sàng", value: "unavailable" }
];

export default function UpdateVenue({ open, onClose, onUpdate, selectedVenue, types, fieldComplexes }) {
  // Rename fieldComplex to complex in state
  const [venueData, setVenueData] = useState(() => {
    if (selectedVenue && selectedVenue.fieldComplex && !selectedVenue.complex) {
      // migrate fieldComplex to complex for backward compatibility
      const { fieldComplex, ...rest } = selectedVenue;
      return { ...rest, complex: fieldComplex };
    }
    return selectedVenue || {};
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedVenue && selectedVenue.fieldComplex && !selectedVenue.complex) {
      // migrate fieldComplex to complex for backward compatibility
      const { fieldComplex, ...rest } = selectedVenue;
      setVenueData({ ...rest, complex: fieldComplex });
    } else {
      setVenueData(selectedVenue || {});
    }
    if (selectedVenue && selectedVenue.images) {
      setImagePreviews(
        selectedVenue.images.map(img =>
          typeof img === "string" ? img : URL.createObjectURL(img)
        )
      );
    } else {
      setImagePreviews([]);
    }
  }, [selectedVenue]);

  const handleChange = (e) => {
    setVenueData({ ...venueData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setVenueData({ ...venueData, images: files });
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleRemoveImage = (index) => {
    const newImages = [...(venueData.images || [])];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setVenueData({ ...venueData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const validate = () => {
    const newErrors = {};
    if (!venueData.name || venueData.name.trim() === "") {
      newErrors.name = "Tên sân là bắt buộc";
    }
    if (!venueData.type) {
      newErrors.type = "Loại sân là bắt buộc";
    }
    if (!venueData.complex) {
      newErrors.complex = "Cụm sân là bắt buộc";
    }
    if (!venueData.location || venueData.location.trim() === "") {
      newErrors.location = "Địa chỉ là bắt buộc";
    }
    if (!venueData.capacity || venueData.capacity <= 0) {
      newErrors.capacity = "Sức chứa phải là số dương";
    }
    if (!venueData.status) {
      newErrors.status = "Trạng thái là bắt buộc";
    }
    if (!venueData.pricePerHour || venueData.pricePerHour <= 0) {
      newErrors.pricePerHour = "Giá thuê mỗi giờ phải là số dương";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = () => {
  if (!validate()) return;
  const dataToSend = {
    ...venueData,
    type: typeof venueData.type === "object" ? venueData.type._id : venueData.type,
    complex:
      typeof venueData.complex === "object"
        ? venueData.complex._id
        : venueData.complex
  };
  onUpdate(dataToSend);
  onClose();
};

  if (!venueData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cập nhật sân</DialogTitle>
      <DialogContent>
        <InputLabel sx={{ mt: 2 }}>Hình ảnh sân</InputLabel>
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
        <InputLabel sx={{ mt: 2 }}>{(venueData.images && venueData.images.length) || 0} đã tải lên</InputLabel>
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

        <TextField margin="dense" label="Tên sân" name="name" fullWidth value={venueData.name || ""} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
        <FormControl fullWidth error={!!errors.type} sx={{ mt: 2 }}>
          <InputLabel>Loại sân</InputLabel>
          <Select
            name="type"
            value={typeof venueData.type === "object" ? venueData.type._id : venueData.type || ""}
            onChange={(e) => {
              setVenueData({
                ...venueData,
                type: e.target.value
              });
              if (errors.type) setErrors({ ...errors, type: undefined });
            }}
            label="Loại sân"
          >
            {types.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
          {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
        </FormControl>


        <InputLabel sx={{ mt: 2 }}>Cụm sân</InputLabel>
        {fieldComplexes && fieldComplexes.length === 1 ? (
          <TextField
            fullWidth
            value={fieldComplexes[0].name}
            disabled
            sx={{ mb: 2 }}
          />
        ) : (
          <FormControl fullWidth error={!!errors.complex} sx={{ mt: 1 }}>
            <InputLabel>Cụm sân</InputLabel>
            <Select
              name="complex"
              value={
                typeof venueData.complex === "object"
                  ? venueData.complex._id
                  : venueData.complex || ""
              }
              onChange={(e) => {
                setVenueData({
                  ...venueData,
                  complex: e.target.value
                });
                if (errors.complex) setErrors({ ...errors, complex: undefined });
              }}
              label="Cụm sân"
            >
              {fieldComplexes && fieldComplexes.map((fc) => (
                <MenuItem key={fc._id} value={fc._id}>{fc.name}</MenuItem>
              ))}
            </Select>
            {errors.complex && <FormHelperText>{errors.complex}</FormHelperText>}
          </FormControl>
        )}

        {/* Ensure complex is set if only one option */}
        {fieldComplexes && fieldComplexes.length === 1 && venueData.complex !== fieldComplexes[0]._id && setVenueData(v => ({ ...v, complex: fieldComplexes[0]._id }))}

        <TextField margin="dense" label="Địa chỉ" name="location" fullWidth value={venueData.location || ""} onChange={handleChange} error={!!errors.location} helperText={errors.location} />
        <TextField margin="dense" label="Sức chứa" name="capacity" fullWidth type="number" value={venueData.capacity || ""} onChange={handleChange} error={!!errors.capacity} helperText={errors.capacity} />
        <FormControl fullWidth error={!!errors.status} sx={{ mt: 2 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select name="status" value={venueData.status || ""} onChange={(e) => {
            handleChange(e);
          }} label="Trạng thái">
            {STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </Select>
          {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
        </FormControl>
        <TextField margin="dense" label="Giá thuê mỗi giờ" name="pricePerHour" fullWidth type="number" value={venueData.pricePerHour || ""} onChange={handleChange} error={!!errors.pricePerHour} helperText={errors.pricePerHour} />
        <InputLabel sx={{ mt: 2 }}>Tiện ích</InputLabel>
        <Autocomplete
          multiple
          options={AMENITIES}
          getOptionLabel={(option) => option.label}
          value={(venueData.amenities || []).map((a) => AMENITIES.find((o) => o.value === a)).filter(Boolean)}
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
        <Button onClick={handleSubmit} variant="contained">Cập nhật</Button>
      </DialogActions>
    </Dialog>
  );
}