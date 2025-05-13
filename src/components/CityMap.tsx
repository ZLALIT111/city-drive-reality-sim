
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from '../contexts/MapContext';
import { useToast } from '@/components/ui/use-toast';

const CityMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { selectedCity, mapApiKey } = useMapContext();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapApiKey) {
      console.log("No Mapbox API key provided");
      return;
    }

    if (!mapContainer.current || !selectedCity) return;

    mapboxgl.accessToken = mapApiKey;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: selectedCity.coordinates,
        zoom: selectedCity.zoom,
        pitch: 60,
        bearing: 0,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'bottom-right'
      );

      map.current.on('load', () => {
        setIsLoading(false);
        toast({
          title: "המפה נטענה בהצלחה",
          description: `כעת אתה נמצא ב${selectedCity.name}`,
        });

        // Add 3D buildings
        if (map.current) {
          const layers = map.current.getStyle().layers;
          
          const labelLayerId = layers?.find(
            (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
          )?.id;

          map.current.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
              }
            },
            labelLayerId
          );
        }
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "שגיאה בטעינת המפה",
        description: "אנא ודא שמפתח ה-API תקין ונסה שנית",
        variant: "destructive",
      });
    }
  }, [selectedCity, mapApiKey, toast]);

  if (!selectedCity) {
    return <div className="flex items-center justify-center h-full">אנא בחר עיר להתחיל</div>;
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="text-white text-lg">טוען מפה...</div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default CityMap;
