import React, { createContext, useState, useContext, ReactNode } from 'react';

export type MapLocation = {
  name: string;
  coordinates: [number, number];
  zoom: number;
};

export type DrivingMode = 'free' | 'route' | 'taxi' | 'bus' | 'educational';
export type MapMode = 'mapbox' | 'free';

export type CarPosition = {
  x: number;
  y: number;
};

export type TrafficLight = {
  id: string;
  x: number;
  y: number;
  state: 'red' | 'yellow' | 'green';
  direction: 'horizontal' | 'vertical';
};

export type RoadSign = {
  id: string;
  x: number;
  y: number;
  type: 'stop' | 'yield' | 'speed-limit' | 'no-entry';
  value?: number; // For speed limits
};

export type MapContextType = {
  selectedCity: MapLocation | null;
  drivingMode: DrivingMode;
  mapApiKey: string;
  mapMode: MapMode;
  carPosition: CarPosition;
  carRotation: number;
  carSpeed: number;
  trafficLights: TrafficLight[];
  roadSigns: RoadSign[];
  otherVehicles: OtherVehicle[];
  setSelectedCity: (city: MapLocation) => void;
  setDrivingMode: (mode: DrivingMode) => void;
  setMapApiKey: (key: string) => void;
  setMapMode: (mode: MapMode) => void;
  setCarPosition: (position: CarPosition) => void;
  setCarRotation: (rotation: number) => void;
  setCarSpeed: (speed: number) => void;
  updateTrafficLight: (id: string, state: 'red' | 'yellow' | 'green') => void;
};

export type OtherVehicle = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  type: 'car' | 'bus' | 'truck';
};

const defaultContextValue: MapContextType = {
  selectedCity: null,
  drivingMode: 'free',
  mapApiKey: '',
  mapMode: 'mapbox',
  carPosition: { x: 400, y: 300 },
  carRotation: 0,
  carSpeed: 0,
  trafficLights: [],
  roadSigns: [],
  otherVehicles: [],
  setSelectedCity: () => {},
  setDrivingMode: () => {},
  setMapApiKey: () => {},
  setMapMode: () => {},
  setCarPosition: () => {},
  setCarRotation: () => {},
  setCarSpeed: () => {},
  updateTrafficLight: () => {},
};

export const MapContext = createContext<MapContextType>(defaultContextValue);

export const useMapContext = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<MapLocation | null>(null);
  const [drivingMode, setDrivingMode] = useState<DrivingMode>('free');
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [mapMode, setMapMode] = useState<MapMode>('mapbox');
  const [carPosition, setCarPosition] = useState<CarPosition>({ x: 400, y: 300 });
  const [carRotation, setCarRotation] = useState<number>(0);
  const [carSpeed, setCarSpeed] = useState<number>(0);
  
  // Initialize traffic lights for the free map mode
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([
    { id: 'tl1', x: 200, y: 120, state: 'red', direction: 'vertical' },
    { id: 'tl2', x: 200, y: 360, state: 'green', direction: 'vertical' },
    { id: 'tl3', x: 600, y: 120, state: 'green', direction: 'vertical' },
    { id: 'tl4', x: 600, y: 360, state: 'red', direction: 'vertical' },
    { id: 'tl5', x: 360, y: 200, state: 'green', direction: 'horizontal' },
    { id: 'tl6', x: 120, y: 200, state: 'red', direction: 'horizontal' },
    { id: 'tl7', x: 360, y: 400, state: 'red', direction: 'horizontal' },
    { id: 'tl8', x: 600, y: 400, state: 'green', direction: 'horizontal' },
  ]);
  
  // Initialize road signs
  const [roadSigns, setRoadSigns] = useState<RoadSign[]>([
    { id: 'rs1', x: 150, y: 150, type: 'stop' },
    { id: 'rs2', x: 650, y: 150, type: 'yield' },
    { id: 'rs3', x: 150, y: 450, type: 'speed-limit', value: 50 },
    { id: 'rs4', x: 650, y: 450, type: 'no-entry' },
  ]);
  
  // Initialize other vehicles
  const [otherVehicles, setOtherVehicles] = useState<OtherVehicle[]>([
    { id: 'v1', x: 250, y: 150, rotation: 0, speed: 2, type: 'car' },
    { id: 'v2', x: 450, y: 250, rotation: 90, speed: 1, type: 'bus' },
    { id: 'v3', x: 350, y: 450, rotation: 180, speed: 1.5, type: 'car' },
    { id: 'v4', x: 150, y: 350, rotation: 270, speed: 2, type: 'truck' },
  ]);
  
  // Update traffic light state
  const updateTrafficLight = (id: string, state: 'red' | 'yellow' | 'green') => {
    setTrafficLights(prevLights => 
      prevLights.map(light => 
        light.id === id ? { ...light, state } : light
      )
    );
  };
  
  // Update other vehicles positions
  React.useEffect(() => {
    if (mapMode !== 'free' || carSpeed === 0) return;
    
    const moveVehiclesInterval = setInterval(() => {
      setOtherVehicles(prevVehicles => 
        prevVehicles.map(vehicle => {
          const radians = (vehicle.rotation * Math.PI) / 180;
          const newX = vehicle.x + Math.sin(radians) * (vehicle.speed);
          const newY = vehicle.y - Math.cos(radians) * (vehicle.speed);
          
          // Keep vehicles within bounds
          let x = newX;
          let y = newY;
          let rotation = vehicle.rotation;
          
          // If vehicle hits boundary, change direction
          if (x < 0 || x > 800 || y < 0 || y > 600) {
            rotation = (rotation + 180) % 360;
            x = vehicle.x;
            y = vehicle.y;
          }
          
          return {
            ...vehicle,
            x,
            y,
            rotation
          };
        })
      );
    }, 50);
    
    // Cycle traffic lights
    const trafficLightInterval = setInterval(() => {
      setTrafficLights(prevLights => {
        return prevLights.map(light => {
          if (light.direction === 'horizontal') {
            // Toggle horizontal lights
            if (light.state === 'red') return { ...light, state: 'green' };
            if (light.state === 'green') return { ...light, state: 'yellow' };
            if (light.state === 'yellow') return { ...light, state: 'red' };
          } else {
            // Toggle vertical lights (opposite of horizontal)
            if (light.state === 'red') return { ...light, state: 'green' };
            if (light.state === 'green') return { ...light, state: 'yellow' };
            if (light.state === 'yellow') return { ...light, state: 'red' };
          }
          return light;
        });
      });
    }, 10000); // Change every 10 seconds
    
    return () => {
      clearInterval(moveVehiclesInterval);
      clearInterval(trafficLightInterval);
    };
  }, [mapMode, carSpeed]);

  return (
    <MapContext.Provider
      value={{
        selectedCity,
        drivingMode,
        mapApiKey,
        mapMode,
        carPosition,
        carRotation,
        carSpeed,
        trafficLights,
        roadSigns,
        otherVehicles,
        setSelectedCity,
        setDrivingMode,
        setMapApiKey,
        setMapMode,
        setCarPosition,
        setCarRotation,
        setCarSpeed,
        updateTrafficLight,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
