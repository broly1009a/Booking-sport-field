import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { favoriteService } from "../../services/api/favoriteService";
import { useAuth } from "../../contexts/authContext";
import { FaRestroom, FaChair, FaHeart, FaRegHeart } from "react-icons/fa";
import { MdOutlineLocalParking, MdShower, MdWifi } from "react-icons/md";

const ListFavorite = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?._id) {
      fetchFavorites();
    }
  }, [currentUser]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteService.getFavorites(currentUser._id);
      setFavorites(res?.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (fieldId) => {
    try {
      await favoriteService.toggleFavorite({
        userId: currentUser._id,
        fieldId,
      });
      fetchFavorites(); // cập nhật lại danh sách sau khi toggle
    } catch (err) {
      console.error("Lỗi toggle yêu thích:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "unavailable": return "bg-red-500";
      case "maintenance": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "parking": return <MdOutlineLocalParking className="text-gray-600" />;
      case "showers": return <MdShower className="text-gray-600" />;
      case "wifi": return <MdWifi className="text-gray-600" />;
      case "seating": return <FaRestroom className="text-gray-600" />;
      case "restrooms": return <FaChair className="text-gray-600" />;
      default: return null;
    }
  };

  if (!currentUser?._id) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Bạn chưa đăng nhập.</h2>
        <p className="text-gray-600">Vui lòng đăng nhập để xem danh sách yêu thích của bạn.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center p-6">
        <h2 className="text-lg font-semibold">Bạn chưa có sân thể thao nào trong danh sách yêu thích cá nhân.</h2>
        <p className="text-gray-600 mb-4">Hãy khám phá các sân và thêm vào danh sách của bạn!</p>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          onClick={() => navigate("/sportfields")}
        >
          Khám phá sân
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {favorites.map((fav) => {
        const field = fav.fieldId;
        return (
          <div
            key={fav._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer relative"
          >
            <div className="relative h-48">
              <img
                src={field.images?.[0] || "https://images.unsplash.com/photo-1560272564-c83b66b1ad12"}
                alt={field.name}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-2 left-2 px-3 py-1 text-sm text-white rounded-full ${getStatusColor(field.status)}`}>
                {field.status || "unknown"}
              </div>
              <div
                className="absolute top-2 right-2 text-red-500 text-xl cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(field._id);
                }}
              >
                <FaHeart className="hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold mb-1">{field.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{field.location}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Capacity: {field.capacity}</span>
                <span className="text-blue-600 font-semibold">${field.pricePerHour || 0}/hr</span>
              </div>
              <div className="flex space-x-2">
                {field.amenities?.map((a, i) => (
                  <div key={i} className="p-2 bg-gray-100 rounded-full">
                    {getAmenityIcon(a)}
                  </div>
                ))}
              </div>
              <button
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                onClick={() => navigate(`/yard-detail/${field._id}`)}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListFavorite;
