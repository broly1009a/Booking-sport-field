import React, { useState, useEffect } from "react";
import { FaUser, FaCalendarAlt, FaHeadset, FaFilter, FaStar, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";

const YardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    timeSlot: "",
    priceRange: [0, 200],
    fieldType: []
  });

  const dummyFields = [
    {
      id: 1,
      name: "Victory Arena",
      image: "https://images.unsplash.com/photo-1459865264687-595d652de67e",
      location: "Downtown Sports Complex",
      price: 80,
      rating: 4.5,
      type: "5v5",
      available: true
    },
    {
      id: 2,
      name: "Champions Field",
      image: "https://images.unsplash.com/photo-1551958219-acbc608c6377",
      location: "Westside Recreation Center",
      price: 120,
      rating: 4.8,
      type: "11v11",
      available: true
    },
    {
      id: 3,
      name: "Elite Soccer Ground",
      image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d",
      location: "Eastside Sports Park",
      price: 95,
      rating: 4.2,
      type: "7v7",
      available: false
    }
  ];

  const dummyBookings = [
    {
      id: 1,
      fieldName: "Victory Arena",
      date: "2024-02-15",
      time: "14:00",
      duration: "2 hours",
      status: "confirmed"
    },
    {
      id: 2,
      fieldName: "Champions Field",
      date: "2024-02-18",
      time: "16:00",
      duration: "1.5 hours",
      status: "pending"
    }
  ];

  useEffect(() => {
    setFields(dummyFields);
    setBookings(dummyBookings);
  }, []);

  const UserProfile = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center space-x-4">
        <img
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d"
          alt="User Avatar"
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold">John Doe</h2>
          <p className="text-gray-600">Premium Member</p>
          <button className="text-blue-600 text-sm hover:underline mt-1">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="font-semibold text-lg">{booking.fieldName}</h3>
      <div className="mt-2 space-y-1 text-gray-600">
        <p>Date: {booking.date}</p>
        <p>Time: {booking.time}</p>
        <p>Duration: {booking.duration}</p>
        <span
          className={`inline-block px-2 py-1 rounded text-sm ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
          Cancel
        </button>
        <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          Reschedule
        </button>
      </div>
    </div>
  );

  const FieldCard = ({ field }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      <img
        src={field.image}
        alt={field.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{field.name}</h3>
        <div className="flex items-center mt-2 text-gray-600">
          <FaMapMarkerAlt className="mr-1" />
          <span>{field.location}</span>
        </div>
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            <FaStar className="text-yellow-400" />
            <span className="ml-1">{field.rating}</span>
          </div>
          <span className="mx-2">•</span>
          <span>{field.type}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="font-semibold">${field.price}/hr</span>
          <button
            className={`px-4 py-2 rounded ${field.available ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
            disabled={!field.available}
          >
            {field.available ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );

  const QuickAccessButtons = () => (
    <div className="grid grid-cols-3 gap-4">
      <button className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors">
        <IoMdFootball className="text-2xl text-blue-500" />
        <span className="mt-2 text-sm">Book New Field</span>
      </button>
      <button className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors">
        <FaCalendarAlt className="text-2xl text-blue-500" />
        <span className="mt-2 text-sm">My Bookings</span>
      </button>
      <button className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors">
        <FaHeadset className="text-2xl text-blue-500" />
        <span className="mt-2 text-sm">Support</span>
      </button>
    </div>
  );

  const FilterBar = () => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-wrap gap-4">
        <select
          className="px-4 py-2 border rounded-md"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        >
          <option value="">All Locations</option>
          <option value="downtown">Downtown</option>
          <option value="westside">Westside</option>
          <option value="eastside">Eastside</option>
        </select>

        <select
          className="px-4 py-2 border rounded-md"
          value={filters.timeSlot}
          onChange={(e) => setFilters({ ...filters, timeSlot: e.target.value })}
        >
          <option value="">Any Time</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="5v5"
            checked={filters.fieldType.includes("5v5")}
            onChange={(e) => {
              const newTypes = e.target.checked
                ? [...filters.fieldType, "5v5"]
                : filters.fieldType.filter((type) => type !== "5v5");
              setFilters({ ...filters, fieldType: newTypes });
            }}
          />
          <label htmlFor="5v5">5v5</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="7v7"
            checked={filters.fieldType.includes("7v7")}
            onChange={(e) => {
              const newTypes = e.target.checked
                ? [...filters.fieldType, "7v7"]
                : filters.fieldType.filter((type) => type !== "7v7");
              setFilters({ ...filters, fieldType: newTypes });
            }}
          />
          <label htmlFor="7v7">7v7</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="11v11"
            checked={filters.fieldType.includes("11v11")}
            onChange={(e) => {
              const newTypes = e.target.checked
                ? [...filters.fieldType, "11v11"]
                : filters.fieldType.filter((type) => type !== "11v11");
              setFilters({ ...filters, fieldType: newTypes });
            }}
          />
          <label htmlFor="11v11">11v11</label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sports Field Booking</h1>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg ${activeTab === "dashboard" ? "bg-blue-500 text-white" : "bg-white"}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeTab === "fields" ? "bg-blue-500 text-white" : "bg-white"}`}
              onClick={() => setActiveTab("fields")}
            >
              Fields
            </button>
          </div>
        </div>

        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            <UserProfile />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Upcoming Bookings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>

            <QuickAccessButtons />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Nearby Fields</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fields.map((field) => (
                  <FieldCard key={field.id} field={field} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <FilterBar />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YardPage;
