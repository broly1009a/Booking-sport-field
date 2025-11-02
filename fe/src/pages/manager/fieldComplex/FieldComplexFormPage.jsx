import React, { useState, useContext } from 'react';
import { fieldComplexService } from '../../../services/api/fieldComplexService';
import FieldComplexForm from '../../../components/fieldComplex/FieldComplexForm';
import Modal from '../../../components/fieldComplex/Modal';
import { useNavigate } from 'react-router-dom';
import { PublicContext } from "../../../contexts/publicContext";
import { toast } from "react-toastify";

export default function FieldComplexFormPage() {
    const { refreshData } = useContext(PublicContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({
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
    const [editId, setEditId] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let submitData = { ...form };
            if (imageFiles.length > 0) {
                const formData = new FormData();
                Object.keys(form).forEach(key => formData.append(key, form[key]));
                imageFiles.forEach(file => formData.append('images', file));
                if (editId) {
                    await fieldComplexService.update(editId, formData);
                } else {
                    await fieldComplexService.create(formData);
                }
            } else {
                if (editId) {
                    await fieldComplexService.update(editId, submitData);
                } else {
                    await fieldComplexService.create(submitData);
                }
            }
            if (typeof refreshData === 'function') {
                refreshData();
            }
            setIsModalOpen(false);
            navigate(-1); // Quay lại trang trước
        } catch (error) {
            toast.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại!");
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                navigate(-1);
            }}
            title={editId ? 'Chỉnh sửa cụm sân' : 'Thêm cụm sân mới'}
        >
            <FieldComplexForm
                form={form}
                setForm={setForm}
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                editId={editId}
                setEditId={setEditId}
                onSubmit={handleSubmit}
                loading={loading}
                onClose={() => {
                    setIsModalOpen(false);
                    navigate(-1);
                }}
            />
        </Modal>
    );
}