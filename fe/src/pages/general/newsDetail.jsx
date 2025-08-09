import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import newsService from "../../services/api/newsService";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const NewsDetail = () => {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const placeholderImage = "https://via.placeholder.com/800x400?text=No+Image";

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch bài viết hiện tại
                const response = await newsService.getNewsById(id);
                setNews(response);

                // Fetch tất cả bài viết để render "Tin liên quan"
                const allNews = await newsService.getAllNews();
                const filteredNews = allNews.filter((item) => item._id !== id);
                setRelatedNews(filteredNews.slice(0, 3)); // Lấy tối đa 3 bài liên quan
            } catch (error) {
                console.error("❌ Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [id]);

    if (loading) {
        return <p className="text-center mt-10 text-lg">🌀 Đang tải bài viết...</p>;
    }
    if (!news) {
        return <p className="text-center mt-10 text-red-500">❌ Không tìm thấy tin tức.</p>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Nội dung chính */}
            <main className="flex-grow max-w-4xl mx-auto p-6">
                {/* Quay lại */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-blue-600 hover:underline flex items-center"
                >
                    ← Quay lại
                </button>

                {/* Tiêu đề */}
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {news.title}
                </h1>

                {/* Meta info */}
                <div className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
                    <span>
                        🕒 {new Date(news.createdAt).toLocaleDateString("vi-VN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                    <span>•</span>
                    <span>✍️ {news.author || "Admin"}</span>
                </div>

                {/* Ảnh chính */}
                <img
                    src={news.thumbnail || news.image || placeholderImage}
                    alt={news.title}
                    className="w-full rounded-xl shadow-lg mb-6"
                    onError={(e) => (e.target.src = placeholderImage)}
                />

                {/* Nội dung */}
                <article
                    className="text-lg leading-relaxed text-gray-800"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                ></article>

                {/* Tin liên quan */}
                {relatedNews.length > 0 && (
                    <div className="mt-10 border-t pt-6">
                        <h2 className="text-2xl font-bold mb-4">📰 Tin liên quan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedNews.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => navigate(`/news/${item._id}`)}
                                    className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md cursor-pointer transition"
                                >
                                    {/* Ảnh */}
                                    <img
                                        src={item.thumbnail || item.image || placeholderImage}
                                        alt={item.title}
                                        className="w-full h-32 object-cover rounded mb-2"
                                        onError={(e) => (e.target.src = placeholderImage)}
                                    />

                                    {/* Tiêu đề */}
                                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                        {item.title}
                                    </h3>

                                    {/* Nội dung rút gọn */}
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {item.content.replace(/<[^>]+>/g, "").slice(0, 100)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* About */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">About Us</h3>
                            <p className="text-gray-400 text-sm">
                                Your trusted platform for football pitch bookings and sports news.
                            </p>
                        </div>
                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                            </ul>
                        </div>
                        {/* Social */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">Follow Us</h3>
                            <div className="flex space-x-4">
                                <FaFacebook className="text-2xl cursor-pointer hover:text-green-400" />
                                <FaTwitter className="text-2xl cursor-pointer hover:text-green-400" />
                                <FaInstagram className="text-2xl cursor-pointer hover:text-green-400" />
                            </div>
                        </div>
                        {/* Newsletter */}
                        <div>
                            <h3 className="text-lg font-bold mb-3">Newsletter</h3>
                            <div className="flex rounded-lg overflow-hidden shadow-md">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="px-4 py-2 bg-white text-black w-full outline-none"
                                />
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 transition duration-300"
                                    onClick={() => alert(`Subscribed: ${email}`)}
                                >
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-gray-500 text-sm border-t border-gray-800 pt-4">
                        © 2025 Football Pitch Booking. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NewsDetail;