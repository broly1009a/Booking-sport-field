import React, { useEffect, useState } from "react";
import { FaGift, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import CouponService from '../../services/api/CouponService';

// Danh sách ảnh voucher mẫu
const voucherImages = [
  'https://cdn-icons-png.flaticon.com/512/3595/3595867.png',
];

// Lấy ảnh ngẫu nhiên ổn định theo mã coupon
const getRandomImage = code => {
  if (!code) return voucherImages[0];
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash += code.charCodeAt(i);
  return voucherImages[hash % voucherImages.length];
};


const Voucher = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const data = await CouponService.getAllCoupons();
        setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      } catch (e) {
        setCoupons([]);
      }
      setLoading(false);
    };
    fetchCoupons();
  }, []);

 
  const getStatus = (coupon) => {
    if (!coupon.expiryDate) return 'valid';
    return new Date(coupon.expiryDate) >= new Date() ? 'valid' : 'expired';
  };


  const getDiscountText = (coupon) => {
    if (coupon.type === 'percent') {
      return `${coupon.value}%` + (coupon.maxDiscount ? ` (tối đa ${coupon.maxDiscount}đ)` : '');
    }
    return coupon.value ? `${coupon.value.toLocaleString()}đ` : '';
  };

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
        {loading ? (
          <div className="text-center text-gray-500">Đang tải voucher...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coupons.length === 0 && <div className="col-span-full text-center text-gray-400">Không có voucher nào</div>}
            {coupons.map((coupon) => {
              const status = getStatus(coupon);
              return (
                <div
                  key={coupon._id}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 relative overflow-hidden border-2 ${
                    status === "expired" ? "opacity-60 border-gray-300" : "border-green-400"
                  }`}
                >
                  <img
                    src={getRandomImage(coupon.code)}
                    alt={coupon.code}
                    className="w-full h-32 object-cover rounded-t-xl"
                  />
                  <div className="p-5">
                    <div className="flex items-center mb-2">
                      <FaGift className="text-green-500 text-xl mr-2" />
                      <h2 className="text-xl font-bold">{coupon.code}</h2>
                    </div>
                    <p className="text-gray-600 mb-2">{coupon.description || ''}</p>
                    <div className="flex items-center mb-2">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold mr-2">
                        {getDiscountText(coupon)}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
                        Mã: {coupon.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-gray-500 text-sm">
                        HSD: {coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : 'Không giới hạn'}
                      </span>
                      {status === "valid" ? (
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
                  {status === "expired" && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-500">Voucher đã hết hạn</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Voucher;