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
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { sportFieldService } from '../../../../services/api/sportFieldService';

const initialState = {
  name: "",
  type: "",
  location: "",
  capacity: "",
  status: "available",
  pricePerHour: "",
  amenities: [],
  images: []
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
  { label: "Bảo trì", value: "maintenance" },
  { label: "Đã đặt", value: "booked" }
];

export default function CreateVenue({ open, onClose, onCreate, types, fieldComplexes}) {
  const [venueData, setVenueData] = useState(initialState);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  useEffect(() => {
    if (fieldComplexes && fieldComplexes.length === 1) {
      setVenueData(v => ({ ...v, complex: fieldComplexes[0]._id }));
    }
  }, [fieldComplexes]);
  


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

  const handleSubmit = () => {
    onCreate(venueData);
    setVenueData(initialState);
    setImagePreviews([]);
    onClose();
  };
// console.log("types", types);
// CREATE
  const handleCreateVenue = async (newVenue) => {
    try {
      const { images, ...data } = newVenue;
      const res = await sportFieldService.createSportField(data, images || []);
      if (res && res) {
        setSportFields(prev => [...prev, res]);
        toast.success("Tạo sân mới thành công!");
      }
      setCreateDialogOpen(false);
    }
    catch (error) {
      toast.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại!");
      setCreateDialogOpen(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thêm sân thể thao</DialogTitle>
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

        <TextField margin="dense" label="Tên sân" name="name" fullWidth value={venueData.name} onChange={handleChange} />
        <InputLabel sx={{ mt: 2 }}>Loại sân</InputLabel>
        <Select name="type" fullWidth value={venueData.type} onChange={handleChange}>
          {types.map((t) => (
            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
          ))}
        </Select>

        <InputLabel sx={{ mt: 2 }}>Cụm sân</InputLabel>
        {fieldComplexes.length === 1 ? (
          <TextField
            fullWidth
            value={fieldComplexes[0].name}
            disabled
            sx={{ mb: 2 }}
          />
        ) : (
          <Select name="complex" fullWidth value={venueData.complex || ''} onChange={handleChange}>
            {fieldComplexes.map((fc) => (
              <MenuItem key={fc._id} value={fc._id}>{fc.name}</MenuItem>
            ))}
          </Select>
        )}

        {/* Ensure complex is set if only one option */}
        <TextField margin="dense" label="Địa chỉ cụ thể" name="location" fullWidth value={venueData.location} onChange={handleChange} />
        <TextField margin="dense" label="Sức chứa" name="capacity" fullWidth type="number" value={venueData.capacity} onChange={handleChange} />
        <InputLabel sx={{ mt: 2 }}>Trạng thái</InputLabel>
        <Select name="status" fullWidth value={venueData.status} onChange={handleChange}>
          {STATUSES.map((s) => (
            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
          ))}
        </Select>
        <TextField margin="dense" label="Giá thuê mỗi giờ" name="pricePerHour" fullWidth type="number" value={venueData.pricePerHour} onChange={handleChange} />
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