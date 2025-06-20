import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import ReactDOMServer from 'react-dom/server';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const createRestaurantIcon = () => {
    const iconHtml = ReactDOMServer.renderToString(<FoodBankIcon style={{ color: '#d02028', fontSize: '40px' }} />);
    return L.divIcon({
        className: 'custom-icon',
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28],
    });
};

const createUserIcon = () => {
    const iconHtml = ReactDOMServer.renderToString(<PersonPinCircleIcon style={{ color: 'rgb(15, 18, 20)', fontSize: '40px' }} />);
    return L.divIcon({
        className: 'custom-icon',
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28],
    });
};

const MiniMap = ({ positions }) => {
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, []);

    const allPositions = userLocation ? [userLocation, ...positions] : positions;

    return (
        <MapContainer
            center={allPositions[0]}
            zoom={16}
            scrollWheelZoom={false}
            style={{ height: '450px', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {allPositions.map((position, index) => (
                <Marker
                    key={index}
                    position={position}
                    icon={index === 0 ? createUserIcon() : createRestaurantIcon()}
                >
                    <Popup>
                        Vị trí {index === 0 ? 'Người dùng' : `Nhà hàng ${index}`}: {position.join(', ')}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MiniMap;
