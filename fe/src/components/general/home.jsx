import React, { useState } from "react";
import { FaInstagram, FaTwitter, FaFacebook, FaClock, FaMoneyBillWave, FaFootballBall, FaCalendarCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const partners = [
        { name: "Stadium A", logo: "https://images.unsplash.com/photo-1522778119026-d647f0596c20" },
        { name: "Stadium B", logo: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9" },
        { name: "Stadium C", logo: "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6" },
        { name: "Stadium D", logo: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6" },
        { name: "Stadium E", logo: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c" },
        { name: "Stadium F", logo: "https://images.unsplash.com/photo-1511886929837-354d827aae26" }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[80vh] flex items-center justify-center">
                <img
                    src="https://images.unsplash.com/photo-1522778034537-20a2486be803"
                    alt="Football Pitch"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                <div className="relative z-20 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Đặt sân trong tích tắc</h1>
                    <p className="text-xl md:text-2xl text-white mb-8">Trải nghiệm các sân thể thao tốt nhất trong khu vực của bạn</p>
                    <button className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-8 rounded-full transition duration-300">Đặt Sân Ngay</button>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                <div
                    onClick={() => navigate('/yard')}
                    className="cursor-pointer bg-[#d66986] text-white rounded-[15px] p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <div className="flex flex-col items-center text-center">
                        <img
                            src="https://booking-sports.com/wp-content/uploads/2024/11/12-white-300x300.png"
                            alt="Tìm kiếm sân chơi"
                            className="w-[113px] mb-4"
                        />
                        <h3 className="text-xl font-bold mb-2">Tìm kiếm sân chơi</h3>
                        <p className="text-[0.95rem] text-[#dedede]">
                            Giúp bạn dễ dàng tìm và chọn sân thể thao trong khuôn viên FPT, với danh sách sân và vị trí cụ thể.
                        </p>
                    </div>
                </div>

                <div
                    className="cursor-pointer bg-[#f3f0e3] text-gray-800 rounded-[15px] p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate("/matchmaking-list")}
                >
                    <div className="flex flex-col items-center text-center">
                        <img
                            src="https://booking-sports.com/wp-content/uploads/2024/11/10-300x300.png"
                            alt="Tìm bạn cùng chơi"
                            className="w-[113px] mb-4"
                        />
                        <h3 className="text-xl font-bold mb-2">Tìm bạn cùng chơi</h3>
                        <p className="text-[0.95rem] text-[#444444]">
                            Người chơi có thể nhanh chóng tìm đối tác phù hợp trên ứng dụng dựa trên bộ lọc các loại hình thể thao, và vị trí mong muốn.
                        </p>
                    </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-[#f3e6e6] text-gray-800 rounded-[15px] p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                        <img
                            src="https://booking-sports.com/wp-content/uploads/2024/11/11-300x300.png"
                            alt="Đặt giờ thuê sân"
                            className="w-[113px] mb-4"
                        />
                        <h3 className="text-xl font-bold mb-2">Đặt giờ thuê sân</h3>
                        <p className="text-[0.95rem] text-[#444444]">
                            Người chơi dễ dàng đặt sân bằng cách chọn bộ môn, sân, ngày và giờ mong muốn với 1 nút bấm, giúp việc đặt sân nhanh chóng và tiện lợi hơn.
                        </p>
                    </div>
                </div>
            </div>


            {/* Partners Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">Our Partner Stadiums</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {partners.map((partner, index) => (
                            <div key={index} className="grayscale hover:grayscale-0 transition duration-300">
                                <img src={partner.logo} alt={partner.name} className="w-full h-24 object-contain" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">About Us</h3>
                            <p className="text-gray-400">Your trusted platform for football pitch bookings</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
                                <FaFacebook className="text-2xl cursor-pointer hover:text-green-500" />
                                <FaTwitter className="text-2xl cursor-pointer hover:text-green-500" />
                                <FaInstagram className="text-2xl cursor-pointer hover:text-green-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                            <div className="flex max-w-md mx-auto shadow-md rounded-lg overflow-hidden">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="px-4 py-2 bg-white text-black w-full outline-none"
                                />
                                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 transition duration-300">
                                    Subscribe
                                </button>
                            </div>

                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                        <p>© 2024 Football Pitch Booking. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;