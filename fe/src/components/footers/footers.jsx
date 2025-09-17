import React, { useState } from "react";
import {
  FaInstagram,
  FaTwitter,
  FaFacebook
} from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Về chúng tôi</h3>
              <p className="text-gray-400">Nền tảng đáng tin cậy của bạn cho việc đặt sân bóng đá</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Về chúng tôi</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Liên hệ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Câu hỏi thường gặp</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Theo dõi chúng tôi</h3>
              <div className="flex space-x-4">
                <FaFacebook className="text-2xl cursor-pointer hover:text-green-500" />
                <FaTwitter className="text-2xl cursor-pointer hover:text-green-500" />
                <FaInstagram className="text-2xl cursor-pointer hover:text-green-500" />
              </div>
            </div>
                <div>
                            <h3 className="text-xl font-bold mb-4">Đăng ký nhận bản tin</h3>
                            <div className="flex max-w-md mx-auto shadow-md rounded-lg overflow-hidden">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn"
                                    className="px-4 py-2 bg-white text-black w-full outline-none"
                                />
                                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 transition duration-300">
                                    Đăng ký
                                </button>
                            </div>

                        </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} FPT Sports Field. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
export default Footer;