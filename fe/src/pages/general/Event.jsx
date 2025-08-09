import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaImage } from "react-icons/fa";
import { eventService } from "../../services/api/eventService";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const res = await eventService.getEvents();
      setEvents(res?.data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-60 flex items-center justify-center mb-12">
        <img
          src={DEFAULT_IMAGE}
          alt="Event Banner"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Sự kiện nổi bật</h1>
          <p className="text-lg md:text-xl text-white">Tham gia các sự kiện thể thao hấp dẫn cùng chúng tôi!</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-gray-500">Đang tải sự kiện...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400">Chưa có sự kiện nào</div>
            ) : (
              events.map((event) => (
                <div
                  key={event._id}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 relative overflow-hidden border-2 ${event.status === "completed" ? "opacity-60 border-gray-300" : "border-blue-400"
                    }`}
                >
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-32 object-cover rounded-t-xl"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded-t-xl">
                      <FaImage className="text-4xl text-gray-400" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-blue-500 text-xl mr-2" />
                      <h2 className="text-xl font-bold">{event.name}</h2>
                    </div>
                    <p className="text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold mr-2">
                        {event.startTime
                          ? new Date(event.startTime).toLocaleDateString("vi-VN")
                          : ""}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
                        {event.fieldId?.name || event.location || "Chưa rõ địa điểm"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      {event.status === "upcoming" || event.status === "ongoing" ? (
                        <span className="flex items-center text-blue-600 font-semibold">
                          <FaCheckCircle className="mr-1" />{" "}
                          {event.status === "upcoming" ? "Sắp diễn ra" : "Đang diễn ra"}
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400 font-semibold">
                          <FaTimesCircle className="mr-1" /> Đã kết thúc
                        </span>
                      )}
                    </div>
                  </div>
                  {event.status === "completed" && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-500">Sự kiện đã kết thúc</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;