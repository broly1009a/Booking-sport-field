import React from "react";
import { FaGift, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const vouchers = [
  {
    id: 1,
    name: "Giảm 20% cho lần đặt đầu tiên",
    description: "Áp dụng cho tất cả các sân, tối đa 100.000đ.",
    discount: "20%",
    image: "https://images.unsplash.com/photo-1511886929837-354d827aae26",
    expiry: "2024-12-31",
    status: "valid",
    code: "WELCOME20"
  },
  {
    id: 2,
    name: "Giảm 50.000đ cho hóa đơn từ 300.000đ",
    description: "Chỉ áp dụng cho sân cỏ nhân tạo.",
    discount: "50.000đ",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c",
    expiry: "2024-10-15",
    status: "expired",
    code: "SYNTHETIC50"
  },
  {
    id: 3,
    name: "Tặng nước miễn phí",
    description: "Tặng 2 chai nước suối cho mỗi lần đặt sân.",
    discount: "2 chai nước",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6",
    expiry: "2024-11-30",
    status: "valid",
    code: "FREENEWATER"
  }
];

const Voucher = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-60 flex items-center justify-center mb-12">
        <img
          src="https://images.unsplash.com/photo-1522778034537-20a2486be803"
          alt="Voucher Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Ưu đãi hấp dẫn</h1>
          <p className="text-lg md:text-xl text-white">Nhận voucher và tiết kiệm khi đặt sân!</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 relative overflow-hidden border-2 ${
                voucher.status === "expired" ? "opacity-60 border-gray-300" : "border-green-400"
              }`}
            >
              <img
                src={voucher.image}
                alt={voucher.name}
                className="w-full h-32 object-cover rounded-t-xl"
              />
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <FaGift className="text-green-500 text-xl mr-2" />
                  <h2 className="text-xl font-bold">{voucher.name}</h2>
                </div>
                <p className="text-gray-600 mb-2">{voucher.description}</p>
                <div className="flex items-center mb-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold mr-2">
                    {voucher.discount}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
                    Mã: {voucher.code}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-500 text-sm">
                    HSD: {voucher.expiry}
                  </span>
                  {voucher.status === "valid" ? (
                    <span className="flex items-center text-green-600 font-semibold">
                      <FaCheckCircle className="mr-1" /> Còn hạn
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-400 font-semibold">
                      <FaTimesCircle className="mr-1" /> Hết hạn
                    </span>
                  )}
                </div>
              </div>
              {voucher.status === "expired" && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">Voucher đã hết hạn</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Voucher;