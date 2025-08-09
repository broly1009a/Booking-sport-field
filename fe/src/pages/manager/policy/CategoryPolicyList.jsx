import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { categoryPolicyService } from "../../../services/api/categoryPolicyService";

const CategoryPolicyList = () => {
    const [categoryPolicies, setCategoryPolicies] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [title, setTitle] = useState('');

    const fetchCategoryPolicies = async () => {
        const res = await categoryPolicyService.getCategories();
        console.log("res", res);

        if (res?.success) {
            setCategoryPolicies(res.data); 
        } else if (Array.isArray(res)) {
            setCategoryPolicies(res);
        } else {
            setCategoryPolicies([]);
        }
    };

    useEffect(() => {
        fetchCategoryPolicies();
    }, []);

    const handleOpen = (item = null) => {
        setEditing(item);
        setTitle(item?.title || '');
        setOpen(true);
    };

    const handleSave = async () => {
        if (editing) {
            await categoryPolicyService.updateCategory(editing._id, { title });
        } else {
            await categoryPolicyService.createCategory({ title });
        }
        setOpen(false);
        fetchCategoryPolicies();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có muốn xóa không?")) {
            await categoryPolicyService.deleteCategory(id);
            fetchCategoryPolicies();
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h5">Danh mục chính sách</Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                Thêm mới
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Tên danh mục</TableCell>
                        <TableCell>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {categoryPolicies.map(c => (
                        <TableRow key={c._id}>
                            <TableCell>{c.title}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleOpen(c)}>Sửa</Button>
                                <Button onClick={() => handleDelete(c._id)} color="error">Xóa</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{editing ? 'Sửa' : 'Thêm'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Tiêu đề"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSave}>Lưu</Button>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryPolicyList;