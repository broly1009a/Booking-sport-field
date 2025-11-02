import React, { useState, useEffect } from 'react';
import { fieldComplexService } from '../../../services/api/fieldComplexService';
import FieldComplexDetail from '../../../components/fieldComplex/FieldComplexDetail';
import { useNavigate, useParams } from 'react-router-dom';
// import { PublicContext } from "../../../contexts/publicContext";
import { toast } from "react-toastify";

export default function FieldComplexDetailPage() {
    // const { refreshData } = useContext(PublicContext);
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
    const [loading, setLoading] = useState(false);
    // Không cần state modal nữa

    useEffect(() => {
        if (id) {
            setLoading(true);
            fieldComplexService.getById(id)
                .then((data) => {
                    if (data) {
                        setForm({
                            name: data?.name || '',
                            location: data?.location || '',
                            description: data?.description || '',
                            images: data?.images || [],
                            owner: data?.owner || '',
                            coordinates: data?.coordinates || { latitude: null, longitude: null },
                            sportFields: data?.sportFields || []
                        });
                    }
                })
                .catch(() => {
                    toast.error('Không tìm thấy cụm sân!');
                    navigate(-1);
                })
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);


//  console.log('FieldComplexDetailPage render with form:', form);
//  console.log('FieldComplexDetailPage render with id:', id);
    return (
        <div className="container mx-auto min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl mt-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Chi tiết cụm sân</h2>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <FieldComplexDetail form={form} />
                        <div className="flex justify-center mt-6">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                onClick={() => navigate(-1)}
                            >
                                Quay lại
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}