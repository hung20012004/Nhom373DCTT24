import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Component to update map view when position changes
const MapUpdater = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position && position.lat && position.lng) {
            map.setView([position.lat, position.lng], 15);
        }
    }, [position, map]);

    return null;
};

const MapEvents = ({ onLocationSelect, setPosition }) => {
    const map = useMap();

    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;

            // Update marker position immediately
            setPosition({ lat, lng });

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&countrycodes=vn`
                );
                const data = await response.json();

                // Only process if address is in Vietnam
                if (data.address.country_code === 'vn') {
                    onLocationSelect({
                        lat,
                        lng,
                        address: data.address,
                        display_name: data.display_name
                    });
                }
            } catch (error) {
                console.error('Error getting address:', error);
            }
        },
    });

    return null;
};

const AddressMap = ({ position, setPosition, onLocationSelect }) => {
    const [map, setMap] = useState(null);

    // Ensure the map recenters when position props change
    useEffect(() => {
        if (map && position && position.lat && position.lng) {
            map.setView([position.lat, position.lng], 15);
        }
    }, [map, position]);

    return (
        <div className="h-64 rounded-lg overflow-hidden border">
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={13}
                className="h-full w-full"
                whenCreated={setMap}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker
                    position={[position.lat, position.lng]}
                    icon={icon}
                />
                <MapEvents
                    onLocationSelect={onLocationSelect}
                    setPosition={setPosition}
                />
                <MapUpdater position={position} />
            </MapContainer>
        </div>
    );
};

export default AddressMap;
