import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map center when coordinates change
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const BreedMap = ({ lat, lng, breedName, region }) => {
  // Default to India center if no coords provided (shouldn't happen with seeded data)
  const position = [lat || 20.5937, lng || 78.9629];
  const zoom = lat ? 6 : 4;

  return (
    <div className="w-full h-full z-0">
      <MapContainer 
        center={position} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lat && lng && (
          <Marker position={position}>
            <Popup>
              <div className="text-center">
                <strong className="text-primary text-lg">{breedName}</strong>
                <br />
                <span className="text-gray-600">{region}</span>
              </div>
            </Popup>
          </Marker>
        )}
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
};

export default BreedMap;
