import React, {useState,useEffect} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import newsService from "../../../services/api/newsService";
import { toast } from "react-toastify";


const UpdateNews = ({ open, onClose, onUpdate, selectedNews }) => {
  const [newsData, setNewsData] = useState({
    title: "",
    content: "",
    author: "",
    image: ""
  });

  useEffect(() => {
    if (selectedNews) {
      setNewsData(selectedNews); // load tin tức cần update
    }
  }, [selectedNews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewsData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!newsData.title || !newsData.content) {
      toast.warning("❗ Vui lòng nhập tiêu đề và nội dung!");
      return;
    }

    try {
      const res = await newsService.updateNews(newsData._id, newsData);
      toast.success("✅ Cập nhật tin tức thành công!");
      onUpdate(res); // gửi dữ liệu mới về dashboard
      setNewsData({ title: "", content: "", author: "", image: "" }); // reset
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("❌ Lỗi khi cập nhật tin tức!");
    }
  };

  const handleClose = () => {
    setNewsData({ title: "", content: "", author: "", image: "" });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Cập Nhật Tin Tức
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "gray" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          label="Tiêu đề"
          name="title"
          value={newsData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Nội dung"
          name="content"
          value={newsData.content}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tác giả"
          name="author"
          value={newsData.author}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Link ảnh (image)"
          name="image"
          value={newsData.image}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateNews;