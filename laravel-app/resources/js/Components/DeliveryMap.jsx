import React, { useEffect, useState } from 'react';

const DeliveryMap = ({ storeLocation, customerLocation }) => {
    const [mapInitialized, setMapInitialized] = useState(false);

    useEffect(() => {
        // Check if both locations are provided and the map hasn't been initialized yet
        if (!storeLocation || !customerLocation || !storeLocation.lat || !customerLocation.lat || mapInitialized) {
            return;
        }

        // Make sure Leaflet is loaded
        if (!window.L) {
            console.error('Leaflet is not loaded');
            return;
        }

        // Create map container if it doesn't exist
        if (!document.getElementById('map').innerHTML) {
            const L = window.L;

            // Initialize the map
            const map = L.map('map').setView([
                (storeLocation.lat + customerLocation.lat) / 2,
                (storeLocation.lng + customerLocation.lng) / 2
            ], 12);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Create fallback icons if custom icons aren't available
            const createIcon = (color) => {
                return L.divIcon({
                    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white;"></div>`,
                    className: '',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
            };

            // Try to use custom icons or fallback to div icons
            let storeIcon, customerIcon;

            try {
                storeIcon = L.icon({
                    iconUrl: '/icons/store-marker.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                customerIcon = L.icon({
                    iconUrl: '/icons/customer-marker.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });
            } catch (e) {
                console.warn('Custom icons not found, using fallback');
                storeIcon = createIcon('#3b82f6'); // blue
                customerIcon = createIcon('#ef4444'); // red
            }

            // Add store marker
            const storeMarker = L.marker([storeLocation.lat, storeLocation.lng], { icon: storeIcon }).addTo(map);
            storeMarker.bindPopup('<b>Cửa hàng</b><br>18 Đường Tam Trinh, Hai Bà Trưng, Hà Nội').openPopup();

            // Add customer marker
            const customerMarker = L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon }).addTo(map);
            customerMarker.bindPopup('<b>Địa chỉ giao hàng</b>');

            // Add a simple line between points if Routing Machine is not available
            if (!L.Routing) {
                const polyline = L.polyline([
                    [storeLocation.lat, storeLocation.lng],
                    [customerLocation.lat, customerLocation.lng]
                ], {color: '#6366f1', weight: 4}).addTo(map);
            } else {
                // Add routing control
                L.Routing.control({
                    waypoints: [
                        L.latLng(storeLocation.lat, storeLocation.lng),
                        L.latLng(customerLocation.lat, customerLocation.lng)
                    ],
                    routeWhileDragging: false,
                    lineOptions: {
                        styles: [{ color: '#6366f1', weight: 4 }]  // Indigo color for the route
                    },
                    createMarker: function() { return null; },  // Don't create markers - we've already added our custom ones
                    show: false  // Hide the routing control panel
                }).addTo(map);
            }

            // Fit bounds to show both markers
            const bounds = L.latLngBounds(
                [storeLocation.lat, storeLocation.lng],
                [customerLocation.lat, customerLocation.lng]
            );
            map.fitBounds(bounds.pad(0.1));  // Add 10% padding around the bounds

            setMapInitialized(true);

            // Cleanup on unmount
            return () => {
                map.remove();
                setMapInitialized(false);
            };
        }
    }, [storeLocation, customerLocation, mapInitialized]);

    return (
        <div id="map" style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}></div>
    );
};

export default DeliveryMap;
