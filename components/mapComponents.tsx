'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

interface MapComponentProps {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  height?: string;
  showDirections?: boolean;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    type: 'pickup' | 'dropoff' | 'driver' | 'passenger';
  }>;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function MapComponent({
  origin,
  destination,
  currentLocation,
  height = '400px',
  showDirections = false,
  markers = []
}: MapComponentProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);

  const mapStyle = {
    ...mapContainerStyle,
    height
  };

  useEffect(() => {
    if (map && origin && destination && showDirections) {
      if (!directionsService.current) {
        directionsService.current = new google.maps.DirectionsService();
      }

      directionsService.current.route(
        {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
          }
        }
      );
    }
  }, [map, origin, destination, showDirections]);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
    
    // Fit bounds to show all markers
    if (markers.length > 0 || origin || destination) {
      const bounds = new google.maps.LatLngBounds();
      
      markers.forEach(marker => {
        bounds.extend(marker.position);
      });
      
      if (origin) bounds.extend(origin);
      if (destination) bounds.extend(destination);
      if (currentLocation) bounds.extend(currentLocation);
      
      map.fitBounds(bounds);
    }
  };

  const getSize = (w: number, h: number) => {
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      return new (window as any).google.maps.Size(w, h);
    }
    return undefined;
  };

  const getMarkerIcon = (type: string) => {
    const icons = {
      pickup: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10B981" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: getSize(24, 24)
      },
      dropoff: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: getSize(24, 24)
      },
      driver: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="8" rx="2" fill="#3B82F6" stroke="white" stroke-width="2"/>
            <circle cx="7" cy="17" r="2" fill="white"/>
            <circle cx="17" cy="17" r="2" fill="white"/>
            <path d="M5 11V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" stroke="white" stroke-width="2"/>
          </svg>
        `),
        scaledSize: getSize(32, 32)
      },
      passenger: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#8B5CF6" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
            <path d="M7 19c0-3 2-5 5-5s5 2 5 5" stroke="white" stroke-width="2" fill="none"/>
          </svg>
        `),
        scaledSize: getSize(24, 24)
      }
    };
    
    return icons[type as keyof typeof icons] || icons.pickup;
  };

  return (
    <LoadScript 
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      libraries={libraries}
    >
      <GoogleMap
        mapContainerStyle={mapStyle}
        center={currentLocation || origin || defaultCenter}
        zoom={13}
        onLoad={onLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Custom markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            icon={getMarkerIcon(marker.type)}
          />
        ))}

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            title="Your Location"
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: getSize(20, 20)
            }}
          />
        )}

        {/* Directions */}
        {directions && showDirections && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3B82F6',
                strokeWeight: 4,
                strokeOpacity: 0.8
              }
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}