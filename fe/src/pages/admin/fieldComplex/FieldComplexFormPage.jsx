import React, { useState, useContext, useEffect } from 'react';
import { fieldComplexService } from '../../../services/api/fieldComplexService';
import FieldComplexForm from '../../../components/fieldComplex/FieldComplexForm';
import { useNavigate, useParams } from 'react-router-dom';
import { PublicContext } from "../../../contexts/publicContext";
import { toast } from "react-toastify";

export default function FieldComplexFormPage() {
    const { refreshData } = useContext(PublicContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const [form, setForm] = useState({
        name: '',
        location: '',
        description: '',
        images: [],
        owner: '',
        coordinates: {
            latitude: null,
            longitude: null
        },
        sportFields: []
    });
    const [editId, setEditId] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    // Không cần state modal nữa

    useEffect(() => {
        if (id) {
            setLoading(true);
            fieldComplexService.getById(id)
                .then((data) => {
                    if (data) {
                        setForm({
                            name: data.name || '',
                            location: data.location || '',
                            description: data.description || '',
                            images: data.images || [],
                            owner: data.owner || '',
                            coordinates: data.coordinates || { latitude: null, longitude: null },
                            sportFields: data.sportFields || []
                        });
                        setEditId(data._id);
                    }
                })
                .catch(() => {
                    toast.error('Không tìm thấy cụm sân!');
                    navigate(-1);
                })
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

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
        <div className="container mx-auto min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl mt-8">
                <h2 className="text-2xl font-bold mb-6 text-center">{editId ? 'Chỉnh sửa cụm sân' : 'Thêm cụm sân mới'}</h2>
                <FieldComplexForm
                    form={form}
                    setForm={setForm}
                    imageFiles={imageFiles}
                    setImageFiles={setImageFiles}
                    editId={editId}
                    setEditId={setEditId}
                    onSubmit={handleSubmit}
                    loading={loading}
                    onClose={() => navigate(-1)}
                />
            </div>
        </div>
    );
}