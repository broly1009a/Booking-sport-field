import { use } from "react";
import newsService from "../../../services/api/newsService";
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaTrash, FaEdit } from "react-icons/fa";
import CreateNews from "./CreateNews";
import UpdateNews from "./UpdateNew";



const NewsDashboard = () => {
    const [newsList, setNewsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await newsService.getAllNews();
                setNewsList(Array.isArray(res) ? res : res.data);
            } catch (error) {
                toast.error("Lỗi khi lấy danh sách tin tức");
            }
        };
        fetchNews();
    }, []);

    const filteredNews = useMemo(() => {
        return newsList.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, newsList]);

    const paginatedNews = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredNews.slice(start, start + itemsPerPage);
    }, [filteredNews, currentPage]);

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

    const handleDeleteNews = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tin này không?")) return;
        try {
            await newsService.deleteNews(id);
            setNewsList(prev => prev.filter(item => item._id !== id));
            toast.success("Xóa tin tức thành công!");
        } catch (error) {
            toast.error("Lỗi khi xóa tin tức");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Quản lý Tin Tức</h1>
                <div className="flex justify-between mb-4">
                    <div className="relative w-full max-w-xs">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin tức..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Thêm Tin Tức
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedNews.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <img
                                            src={item.image || item.thumbnail}
                                            alt={item.title }
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => { e.target.src = "/default-thumbnail.jpg"; }} // fallback nếu lỗi ảnh
                                        />
                                    </td>
                                    <td className="px-6 py-4">{item.title}</td>
                                    <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{item.author || "Admin"}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedNews(item);
                                                    setUpdateDialogOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNews(item._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>

                    {/* Pagination */}
                    <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border disabled:opacity-50"
                        >
                            Tiếp
                        </button>
                    </div>
                </div>
            </div>
            <CreateNews
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCreate={(newNews) => setNewsList(prev => [...prev, newNews])}
            />

            {/* Dialog cập nhật */}
            <UpdateNews
        open={updateDialogOpen}
        onClose={() => {
          setUpdateDialogOpen(false);
          setSelectedNews(null);
        }}
        selectedNews={selectedNews}
        onUpdate={(updated) => {
          setNewsList(prev => prev.map(n => n._id === updated._id ? updated : n));
        }}
      />
        </div>
    );
};

export default NewsDashboard;