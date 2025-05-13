
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from '../contexts/MapContext';
import { useToast } from '@/components/ui/use-toast';

const CityMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { selectedCity, mapApiKey, mapMode } = useMapContext();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // For free map mode
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (mapMode === 'free') {
      setIsLoading(false);
      renderFreeMap();
      return;
    }

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
  }, [selectedCity, mapApiKey, mapMode, toast]);

  // Function to render the free map
  const renderFreeMap = () => {
    if (!canvasRef.current || !selectedCity) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    contextRef.current = ctx;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw city map
    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(0, 0, width, height);
    
    // Draw roads
    drawRoads(ctx, width, height);
    
    // Draw buildings
    drawBuildings(ctx, width, height);
    
    // Add city name
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(selectedCity.name, width / 2, 30);
    
    toast({
      title: "המפה נטענה בהצלחה",
      description: `כעת אתה נמצא במפת הדמה של ${selectedCity.name}`,
    });
  };
  
  const drawRoads = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Main roads
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#a0a0a0';
    
    // Horizontal main roads
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height * i / 5);
      ctx.lineTo(width, height * i / 5);
      ctx.stroke();
    }
    
    // Vertical main roads
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(width * i / 5, 0);
      ctx.lineTo(width * i / 5, height);
      ctx.stroke();
    }
    
    // Secondary roads
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c0c0c0';
    
    // Horizontal secondary roads
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 1) continue; // Skip where main roads are
      ctx.beginPath();
      ctx.moveTo(0, height * i / 10);
      ctx.lineTo(width, height * i / 10);
      ctx.stroke();
    }
    
    // Vertical secondary roads
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 1) continue; // Skip where main roads are
      ctx.beginPath();
      ctx.moveTo(width * i / 10, 0);
      ctx.lineTo(width * i / 10, height);
      ctx.stroke();
    }
  };
  
  const drawBuildings = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Commercial area in the center
    ctx.fillStyle = '#d0d0ff';
    ctx.fillRect(width * 0.3, height * 0.3, width * 0.4, height * 0.4);
    
    // Residential buildings
    ctx.fillStyle = '#ffe0c0';
    
    const buildingSize = 15;
    const gap = 10;
    
    for (let x = 20; x < width; x += (buildingSize + gap)) {
      for (let y = 20; y < height; y += (buildingSize + gap)) {
        // Skip commercial area
        if (x > width * 0.3 && x < width * 0.7 && 
            y > height * 0.3 && y < height * 0.7) {
          continue;
        }
        
        // Skip roads
        if ((x % (width / 5) < 10 || y % (height / 5) < 10) ||
            (x % (width / 10) < 5 || y % (height / 10) < 5)) {
          continue;
        }
        
        // Random building height for 3D effect
        const buildingHeight = Math.floor(Math.random() * 10) + 5;
        
        // Draw building
        ctx.fillRect(x, y, buildingSize, buildingSize);
        
        // Add simple 3D effect
        ctx.fillStyle = '#d0c0a0';
        ctx.beginPath();
        ctx.moveTo(x + buildingSize, y);
        ctx.lineTo(x + buildingSize + 3, y - 3);
        ctx.lineTo(x + buildingSize + 3, y + buildingHeight - 3);
        ctx.lineTo(x + buildingSize, y + buildingSize);
        ctx.fill();
        
        ctx.fillStyle = '#ffe0c0';
      }
    }
    
    // Add some parks/green areas
    ctx.fillStyle = '#c0ffc0';
    ctx.fillRect(width * 0.1, height * 0.1, width * 0.1, height * 0.1);
    ctx.fillRect(width * 0.8, height * 0.1, width * 0.1, height * 0.1);
    ctx.fillRect(width * 0.1, height * 0.8, width * 0.1, height * 0.1);
    ctx.fillRect(width * 0.8, height * 0.8, width * 0.1, height * 0.1);
  };

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
      {mapMode === 'mapbox' ? (
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
      ) : (
        <canvas 
          ref={canvasRef}
          className="w-full h-full rounded-lg" 
          width={800}
          height={600}
        />
      )}
    </div>
  );
};

export default CityMap;
