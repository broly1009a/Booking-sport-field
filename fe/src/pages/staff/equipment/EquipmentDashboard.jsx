import React, { useEffect, useState, useContext } from "react";
import equipmentService from "../../../services/api/equipmentService";
import { PublicContext } from "../../../contexts/publicContext";
import EquipmentFormModel from "./EquipmentFormModel";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const EquipmentDashboard = () => {
  const { types, sportFields } = useContext(PublicContext);
  const [equipments, setEquipments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  // Modal xem danh sách sân
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldModalList, setFieldModalList] = useState([]);
  const [fieldSearch, setFieldSearch] = useState("");
  const [fieldPage, setFieldPage] = useState(1);
  const fieldsPerPage = 10;

  const fetchData = async () => {
    try {
      const equipmentData = await equipmentService.getAllEquipment();
      setEquipments(equipmentData.data);
    } catch (error) {
      toast.error("Không thể tải danh sách thiết bị");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (data) => {
    if (editingItem) {
      try {
        await equipmentService.updateEquipment(editingItem._id, data);
        toast.success("Cập nhật thiết bị thành công");
      } catch (error) {
        toast.error("Cập nhật thất bại");
      }
    } else {
      try {
        await equipmentService.createEquipment(data);
        toast.success("Thêm thiết bị thành công");
      } catch (error) {
        toast.error("Thêm thất bại");
      }
    }
    setModalOpen(false);
    setEditingItem(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      try {
        await equipmentService.deleteEquipment(id);
        toast.success("Xóa thiết bị thành công");
        fetchData();
      } catch {
        toast.error("Xóa thất bại");
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" mb={3} color="#388e3c">
        Quản lý thiết bị
      </Typography>
      <Button
        variant="contained"
        color="success"
        sx={{ mb: 2, borderRadius: 2 }}
        onClick={handleOpenCreate}
      >
        + Thêm thiết bị
      </Button>
      <TextField
        label="Tìm kiếm thiết bị theo tên"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#e0f2e9" }}>
            <TableRow>
              <TableCell>Tên thiết bị</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Giá đơn vị</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Sân áp dụng</TableCell>
              <TableCell align="center">Công cụ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(() => {
              const filtered = equipments.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
              const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
              return (
                <>
                  {paginated.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Chip label={item.type} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        {item.pricePerUnit.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status === "available" ? "Còn hàng" : "Hết hàng"}
                          color={item.status === "available" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {item.sportField.length <= 3 ? (
                          <Stack direction="row" spacing={1}>
                            {item.sportField.map((field) => (
                              <Chip key={field._id} label={field.name} size="small" />
                            ))}
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={1}>
                            {item.sportField.slice(0, 3).map((field) => (
                              <Chip key={field._id} label={field.name} size="small" />
                            ))}
                            <Chip
                              label={`...${item.sportField.length} sân`}
                              color="info"
                              size="small"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => {
                                setFieldModalList(item.sportField);
                                setFieldModalOpen(true);
                                setFieldSearch("");
                                setFieldPage(1);
                              }}
                            />
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleOpenEdit(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(item._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">Chưa có thiết bị nào</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })()}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
        <Pagination
          count={Math.ceil(equipments.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).length / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
      <EquipmentFormModel
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingItem}
        sportFields={sportFields}
        types={types}
      />

      {/* Modal danh sách sân áp dụng */}
      <Dialog open={fieldModalOpen} onClose={() => setFieldModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Danh sách sân áp dụng</DialogTitle>
        <DialogContent>
          <TextField
            label="Tìm kiếm sân"
            value={fieldSearch}
            onChange={e => { setFieldSearch(e.target.value); setFieldPage(1); }}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          {(() => {
            const filtered = fieldModalList.filter(f => f.name.toLowerCase().includes(fieldSearch.toLowerCase()));
            const paginated = filtered.slice((fieldPage - 1) * fieldsPerPage, fieldPage * fieldsPerPage);
            return (
              <>
                {paginated.length === 0 ? (
                  <Typography color="text.secondary">Không có sân phù hợp</Typography>
                ) : (
                  <Stack spacing={1}>
                    {paginated.map(f => (
                      <Chip key={f._id} label={f.name} size="medium" />
                    ))}
                  </Stack>
                )}
                <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                  <Pagination
                    count={Math.ceil(filtered.length / fieldsPerPage)}
                    page={fieldPage}
                    onChange={(e, value) => setFieldPage(value)}
                    color="primary"
                  />
                </Box>
              </>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldModalOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentDashboard;