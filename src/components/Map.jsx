import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Map.module.css";
import {
  Marker,
  TileLayer,
  MapContainer,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/UseGeoLocation";
import Button from "./Button";
import { useUrlPosition } from "../hooks/useUrlPosition";

function Map() {
  const [mapPosition, setMapPostion] = useState([40, 0]);
  const { cities } = useCities();
  const {
    isLoading: isLoadingPosition,
    position: geoLoadtionPosition,
    getPosition,
  } = useGeolocation();
  const [maplat, maplng] = useUrlPosition();
  useEffect(
    function () {
      if (maplat && maplng) setMapPostion([maplat, maplng]);
    },
    [maplat, maplng]
  );

  useEffect(
    function () {
      if (geoLoadtionPosition)
        setMapPostion([geoLoadtionPosition.lat, geoLoadtionPosition.lng]);
    },
    [geoLoadtionPosition]
  );

  return (
    <div className={styles.mapContainer}>
      {!geoLoadtionPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? " Loading.." : "use Your Position"}
        </Button>
      )}
      <MapContainer
        center={[maplat || 40, maplng || 0]}
        zoom={13}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{city.cityName}</span>
              <span>{city.emoji}</span>
            </Popup>
          </Marker>
        ))}
        <ChnageCenter postion={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChnageCenter({ postion }) {
  const map = useMap();
  map.setView(postion);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();
  useMapEvent({
    click: (e) => {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng} `);
    },
  });
}
export default Map;
