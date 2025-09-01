'use client';

import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Deposit, MapConfig } from '@/lib/types';
import { getMarkerColor, BULGARIA_CENTER, mapStyles } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GoogleMapComponentProps {
  deposits: Deposit[];
  onMarkerClick?: (deposit: Deposit) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = BULGARIA_CENTER;

const defaultOptions: google.maps.MapOptions = {
  zoom: 7,
  center: defaultCenter,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: mapStyles,
  mapTypeId: 'roadmap'
};

export default function GoogleMapComponent({ 
  deposits, 
  onMarkerClick 
}: GoogleMapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    if (clusterer) {
      clusterer.clearMarkers();
    }
  }, [clusterer]);

  // Create markers and clustering
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    if (clusterer) {
      clusterer.clearMarkers();
    }

    // Create new markers
    const newMarkers: google.maps.Marker[] = [];
    const validDeposits = deposits.filter(d => d.coordinates && !d.id.includes("Идентифика"));

    validDeposits.forEach(deposit => {
      if (!deposit.coordinates) return;

      const marker = new google.maps.Marker({
        position: {
          lat: deposit.coordinates[0],
          lng: deposit.coordinates[1]
        },
        title: deposit.nahodishte,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getMarkerColor(deposit),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8
        }
      });

      marker.addListener('click', () => {
        setSelectedDeposit(deposit);
        if (onMarkerClick) {
          onMarkerClick(deposit);
        }
      });

      newMarkers.push(marker);
    });

    // Create clusterer with default algorithm
    const newClusterer = new MarkerClusterer({
      markers: newMarkers,
      map
    });

    setMarkers(newMarkers);
    setClusterer(newClusterer);

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
      newClusterer.clearMarkers();
    };
  }, [map, deposits, onMarkerClick]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold mb-2">Google Maps API Key Missing</p>
          <p className="text-gray-600">Please add your API key to the .env.local file</p>
          <p className="text-sm text-gray-500 mt-2">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here</p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      loadingElement={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      }
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        options={defaultOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {selectedDeposit && selectedDeposit.coordinates && (
          <InfoWindow
            position={{
              lat: selectedDeposit.coordinates[0],
              lng: selectedDeposit.coordinates[1]
            }}
            onCloseClick={() => setSelectedDeposit(null)}
          >
            <div className="p-2 max-w-sm">
              <h3 className="font-bold text-lg mb-2">{selectedDeposit.nahodishte}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">ID:</span> {selectedDeposit.id}</p>
                <p><span className="font-semibold">Концесионер:</span> {selectedDeposit.koncesioner || 'Н/Д'}</p>
                <p><span className="font-semibold">Община:</span> {selectedDeposit.obshtina}</p>
                <p><span className="font-semibold">Област:</span> {selectedDeposit.oblast}</p>
                <p><span className="font-semibold">Минерал:</span> {selectedDeposit.vid_bogatstvo}</p>
                <p><span className="font-semibold">Група:</span> {selectedDeposit.grupa_bogatstvo}</p>
                <p><span className="font-semibold">Статус:</span> {selectedDeposit.status}</p>
                <p><span className="font-semibold">Срок:</span> {selectedDeposit.srok_koncesiya}</p>
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Точност:</span> {selectedDeposit.coordinate_confidence}
                </p>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}