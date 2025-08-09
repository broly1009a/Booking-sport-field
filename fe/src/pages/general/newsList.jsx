import React, { useEffect, useState } from "react";
import newsService from "../../services/api/newsService";
import { useNavigate } from "react-router-dom";
import { 
    FaInstagram, 
    FaTwitter, 
    FaFacebook 
} from "react-icons/fa";

const NewsList = () => {
    const [email, setEmail] = useState("");
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await newsService.getAllNews();
                console.log("News fetched:", response); // Log để debug
                setNews(Array.isArray(response) ? response : response.data);
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return <p className="text-center mt-8">Đang tải tin tức...</p>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Nội dung chính */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">📢 Danh sách tin tức</h1>
                    {news.length === 0 ? (
                        <p className="text-gray-500">Không có tin tức nào.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                                >
                                    <img
                                        src={item.thumbnail || item.image || "https://via.placeholder.com/400x200?text=No+Image"}
                                        alt={item.title}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                    <div className="p-4 flex flex-col justify-between flex-grow">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h2>
                                        <p className="text-gray-600 text-sm flex-grow line-clamp-3">
                                            {item.content}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Ngày đăng:{" "}
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                        <button
                                            onClick={() => navigate(`/news/${item._id}`)}
                                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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

export default NewsList;