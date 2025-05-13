
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from '../contexts/MapContext';
import { useToast } from '@/components/ui/use-toast';

const CityMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { 
    selectedCity, 
    mapApiKey, 
    mapMode, 
    carPosition, 
    carRotation, 
    carSpeed,
    trafficLights,
    roadSigns,
    otherVehicles 
  } = useMapContext();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // For free map mode
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [collisionDetected, setCollisionDetected] = useState(false);
  const [atTrafficLight, setAtTrafficLight] = useState<string | null>(null);

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

  // Collision detection with road signs and traffic lights
  useEffect(() => {
    if (mapMode !== 'free') return;
    
    // Check collision with traffic lights
    const nearbyTrafficLight = trafficLights.find(light => {
      const distance = Math.sqrt(
        Math.pow(light.x - carPosition.x, 2) + 
        Math.pow(light.y - carPosition.y, 2)
      );
      return distance < 30; // Within 30px of traffic light
    });
    
    if (nearbyTrafficLight) {
      setAtTrafficLight(nearbyTrafficLight.id);
      
      // If at a red light and moving
      if (nearbyTrafficLight.state === 'red' && Math.abs(carSpeed) > 0) {
        setCollisionDetected(true);
        toast({
          title: "נסיעה באדום!",
          description: "עצרת באור אדום",
          variant: "destructive",
        });
      } else {
        setCollisionDetected(false);
      }
    } else {
      setAtTrafficLight(null);
    }
    
    // Check collision with road signs
    const nearbyStopSign = roadSigns.find(sign => {
      const distance = Math.sqrt(
        Math.pow(sign.x - carPosition.x, 2) + 
        Math.pow(sign.y - carPosition.y, 2)
      );
      return distance < 25 && sign.type === 'stop';
    });
    
    if (nearbyStopSign && Math.abs(carSpeed) > 0) {
      setCollisionDetected(true);
      toast({
        title: "חובה לעצור!",
        description: "לא עצרת בתמרור עצור",
        variant: "destructive",
      });
    }
    
    // Check collision with other vehicles
    const collision = otherVehicles.some(vehicle => {
      const distance = Math.sqrt(
        Math.pow(vehicle.x - carPosition.x, 2) + 
        Math.pow(vehicle.y - carPosition.y, 2)
      );
      return distance < 35; // Vehicle collision radius
    });
    
    if (collision && Math.abs(carSpeed) > 0) {
      setCollisionDetected(true);
      toast({
        title: "התנגשות!",
        description: "התנגשת ברכב אחר",
        variant: "destructive",
      });
    }
    
    // Speed limit check
    const nearbySpeedLimit = roadSigns.find(sign => {
      const distance = Math.sqrt(
        Math.pow(sign.x - carPosition.x, 2) + 
        Math.pow(sign.y - carPosition.y, 2)
      );
      return distance < 25 && sign.type === 'speed-limit';
    });
    
    if (nearbySpeedLimit && Math.abs(carSpeed) > (nearbySpeedLimit.value || 50)) {
      toast({
        title: "מהירות מופרזת!",
        description: `חרגת ממגבלת המהירות (${nearbySpeedLimit.value} קמ"ש)`,
        variant: "destructive",
      });
    }
    
  }, [carPosition, carSpeed, trafficLights, roadSigns, otherVehicles, mapMode, toast]);

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
    
    // Draw traffic lights
    drawTrafficLights(ctx);
    
    // Draw road signs
    drawRoadSigns(ctx);
    
    // Draw other vehicles
    drawOtherVehicles(ctx);
    
    // Draw player car
    drawCar(ctx, carPosition.x, carPosition.y, carRotation, carSpeed);
    
    // Add city name
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(selectedCity.name, width / 2, 30);
    
    if (animationFrameRef.current === null) {
      toast({
        title: "המפה נטענה בהצלחה",
        description: `כעת אתה נמצא במפת הדמה של ${selectedCity.name}`,
      });
    }
    
    // Request next animation frame
    animationFrameRef.current = requestAnimationFrame(renderFreeMap);
  };
  
  // Draw the car on the canvas
  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, speed: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Car body
    ctx.fillStyle = collisionDetected ? '#ff3333' : (speed < 0 ? '#ff6666' : '#3366ff');
    ctx.fillRect(-15, -10, 30, 20);
    
    // Car roof
    ctx.fillStyle = '#222222';
    ctx.fillRect(-10, -8, 20, 16);
    
    // Wheels
    ctx.fillStyle = '#333333';
    ctx.fillRect(-12, -12, 6, 4); // Front left
    ctx.fillRect(6, -12, 6, 4);   // Front right
    ctx.fillRect(-12, 8, 6, 4);   // Back left
    ctx.fillRect(6, 8, 6, 4);     // Back right
    
    // Headlights
    if (speed > 0) {
      ctx.fillStyle = '#ffff00';
      // Show brighter lights if moving forward
      ctx.beginPath();
      ctx.moveTo(15, -6);
      ctx.lineTo(30, -15);
      ctx.lineTo(30, 3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(15, 6);
      ctx.lineTo(30, 15);
      ctx.lineTo(30, -3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
      ctx.fill();
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(-14, -6, 2, 4); // Left headlight
    ctx.fillRect(12, -6, 2, 4);  // Right headlight
    
    // Taillights (red when braking)
    ctx.fillStyle = speed < 0 || carSpeed === 0 ? '#ff0000' : '#660000';
    ctx.fillRect(-14, 2, 2, 4); // Left
    ctx.fillRect(12, 2, 2, 4);  // Right
    
    // Speed indicator
    if (Math.abs(speed) > 0) {
      ctx.font = '10px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.abs(speed)}`, 0, 4);
    }
    
    ctx.restore();
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
      
      // Road markings
      ctx.setLineDash([15, 15]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, height * i / 5);
      ctx.lineTo(width, height * i / 5);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Vertical main roads
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#a0a0a0';
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(width * i / 5, 0);
      ctx.lineTo(width * i / 5, height);
      ctx.stroke();
      
      // Road markings
      ctx.setLineDash([15, 15]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(width * i / 5, 0);
      ctx.lineTo(width * i / 5, height);
      ctx.stroke();
      ctx.setLineDash([]);
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
    
    // Draw intersections
    for (let x = 1; x < 5; x++) {
      for (let y = 1; y < 5; y++) {
        ctx.fillStyle = '#909090';
        ctx.fillRect(
          width * x / 5 - 8, 
          height * y / 5 - 8, 
          16, 
          16
        );
      }
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
        if ((x % (width / 5) < 15 || y % (height / 5) < 15) ||
            (x % (width / 10) < 10 || y % (height / 10) < 10)) {
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
  
  const drawTrafficLights = (ctx: CanvasRenderingContext2D) => {
    trafficLights.forEach(light => {
      ctx.save();
      ctx.translate(light.x, light.y);
      
      // Draw traffic light pole
      ctx.fillStyle = '#555';
      ctx.fillRect(-2, -15, 4, 30);
      
      // Draw traffic light housing
      ctx.fillStyle = '#333';
      if (light.direction === 'horizontal') {
        ctx.fillRect(0, -10, 15, 20);
        
        // Red light
        ctx.fillStyle = light.state === 'red' ? '#ff0000' : '#550000';
        ctx.beginPath();
        ctx.arc(8, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Yellow light
        ctx.fillStyle = light.state === 'yellow' ? '#ffff00' : '#555500';
        ctx.beginPath();
        ctx.arc(8, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Green light
        ctx.fillStyle = light.state === 'green' ? '#00ff00' : '#005500';
        ctx.beginPath();
        ctx.arc(8, 5, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-10, 0, 20, 15);
        
        // Red light
        ctx.fillStyle = light.state === 'red' ? '#ff0000' : '#550000';
        ctx.beginPath();
        ctx.arc(-5, 8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Yellow light
        ctx.fillStyle = light.state === 'yellow' ? '#ffff00' : '#555500';
        ctx.beginPath();
        ctx.arc(0, 8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Green light
        ctx.fillStyle = light.state === 'green' ? '#00ff00' : '#005500';
        ctx.beginPath();
        ctx.arc(5, 8, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  };
  
  const drawRoadSigns = (ctx: CanvasRenderingContext2D) => {
    roadSigns.forEach(sign => {
      ctx.save();
      ctx.translate(sign.x, sign.y);
      
      // Draw sign pole
      ctx.fillStyle = '#777';
      ctx.fillRect(-1, -15, 2, 30);
      
      switch (sign.type) {
        case 'stop':
          // Stop sign (octagon)
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            const x = Math.cos(angle) * 10;
            const y = Math.sin(angle) * 10;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();
          
          // STOP text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('STOP', 0, 0);
          break;
          
        case 'yield':
          // Yield sign (triangle)
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(10, 10);
          ctx.lineTo(-10, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
          
        case 'speed-limit':
          // Speed limit sign (circle)
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Speed limit text
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 8px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${sign.value || ''}`, 0, 0);
          break;
          
        case 'no-entry':
          // No entry sign (circle with bar)
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Red bar
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(-8, -2, 16, 4);
          break;
      }
      
      ctx.restore();
    });
  };
  
  const drawOtherVehicles = (ctx: CanvasRenderingContext2D) => {
    otherVehicles.forEach(vehicle => {
      ctx.save();
      ctx.translate(vehicle.x, vehicle.y);
      ctx.rotate((vehicle.rotation * Math.PI) / 180);
      
      // Different vehicle types
      switch (vehicle.type) {
        case 'car':
          // Car body
          ctx.fillStyle = '#cc3333';
          ctx.fillRect(-12, -8, 24, 16);
          
          // Car roof
          ctx.fillStyle = '#222222';
          ctx.fillRect(-8, -6, 16, 12);
          
          // Wheels
          ctx.fillStyle = '#333333';
          ctx.fillRect(-10, -10, 5, 3); // Front left
          ctx.fillRect(5, -10, 5, 3);   // Front right
          ctx.fillRect(-10, 7, 5, 3);   // Back left
          ctx.fillRect(5, 7, 5, 3);     // Back right
          break;
          
        case 'bus':
          // Bus body
          ctx.fillStyle = '#3399cc';
          ctx.fillRect(-20, -10, 40, 20);
          
          // Bus windows
          ctx.fillStyle = '#99ccff';
          for (let i = -15; i < 15; i += 8) {
            ctx.fillRect(i, -8, 6, 5);  // Top windows
            ctx.fillRect(i, 3, 6, 5);   // Bottom windows
          }
          
          // Wheels
          ctx.fillStyle = '#333333';
          ctx.fillRect(-15, -12, 6, 4); // Front left
          ctx.fillRect(9, -12, 6, 4);   // Front right
          ctx.fillRect(-15, 8, 6, 4);   // Back left
          ctx.fillRect(9, 8, 6, 4);     // Middle right
          break;
          
        case 'truck':
          // Truck cab
          ctx.fillStyle = '#996633';
          ctx.fillRect(-15, -8, 10, 16);
          
          // Truck cargo
          ctx.fillStyle = '#ccaa66';
          ctx.fillRect(-5, -10, 20, 20);
          
          // Wheels
          ctx.fillStyle = '#333333';
          ctx.fillRect(-12, -10, 5, 4); // Front left
          ctx.fillRect(-12, 6, 5, 4);   // Front right
          ctx.fillRect(5, -10, 5, 4);   // Back left
          ctx.fillRect(5, 6, 5, 4);     // Back right
          break;
      }
      
      ctx.restore();
    });
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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
      
      {atTrafficLight && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded">
          {trafficLights.find(l => l.id === atTrafficLight)?.state === 'red' ? 
            'עצור! אור אדום' : 
            trafficLights.find(l => l.id === atTrafficLight)?.state === 'yellow' ? 
              'האט! אור צהוב' : 
              'אפשר להמשיך! אור ירוק'
          }
        </div>
      )}
      
      {collisionDetected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-500 bg-opacity-70 text-white p-6 rounded-lg text-2xl animate-pulse">
            התנגשות!
          </div>
        </div>
      )}
    </div>
  );
};

export default CityMap;
