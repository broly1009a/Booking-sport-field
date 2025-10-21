import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const FormCoordinates = ({ coordinates, onCoordinatesChange }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLat, setSelectedLat] = useState(coordinates?.latitude || null);
  const [selectedLng, setSelectedLng] = useState(coordinates?.longitude || null);


  // Center map on current coordinates or default to a central location
  const mapCenter = selectedLat && selectedLng 
    ? [selectedLat, selectedLng] 
    : [10.762622, 106.660172]; // Default to HCMC center

  // Component để lắng nghe sự kiện click trên bản đồ
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setSelectedLat(e.latlng.lat);
        setSelectedLng(e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <>
      <div className="mb-3">
        <button 
          type="button"
          onClick={() => setShowMapModal(true)}
          className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <i className="fas fa-map-marker-alt mr-2"></i>
          Chọn vị trí trên bản đồ
        </button>
        {coordinates?.latitude && coordinates?.longitude && (
          <div className="mt-2 text-sm text-gray-600">
            Vị trí đã chọn: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          </div>
        )}
      </div>

      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-500 opacity-75 pointer-events-none" aria-hidden="true"></div>
          {/* Modal panel */}
          <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-4xl w-full pointer-events-auto">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Chọn vị trí trên bản đồ
                  </h3>
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setSelectedLat(pos.coords.latitude);
                            setSelectedLng(pos.coords.longitude);
                          });
                        } else {
                          alert("Trình duyệt không hỗ trợ lấy vị trí!");
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <i className="fas fa-location-arrow mr-2"></i>
                      Lấy vị trí hiện tại
                    </button>
                  </div>
                  <div className="h-96 w-full mb-4">
                    <MapContainer center={mapCenter} zoom={13} style={{ width: "100%", height: "100%" }} scrollWheelZoom={true}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker />
                      {selectedLat && selectedLng && (
                        <Marker position={[selectedLat, selectedLng]}>
                          <Popup>Vị trí đã chọn</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                  {selectedLat && selectedLng && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Vị trí đã chọn:</strong> {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                disabled={!(selectedLat && selectedLng)}
                onClick={() => {
                  if (selectedLat && selectedLng) {
                    onCoordinatesChange({
                      latitude: selectedLat,
                      longitude: selectedLng
                    });
                    setShowMapModal(false);
                  }
                }}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300"
              >
                Lưu vị trí
              </button>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormCoordinates;
