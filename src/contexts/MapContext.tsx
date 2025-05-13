
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

export type MapContextType = {
  selectedCity: MapLocation | null;
  drivingMode: DrivingMode;
  mapApiKey: string;
  mapMode: MapMode;
  carPosition: CarPosition;
  carRotation: number;
  carSpeed: number;
  setSelectedCity: (city: MapLocation) => void;
  setDrivingMode: (mode: DrivingMode) => void;
  setMapApiKey: (key: string) => void;
  setMapMode: (mode: MapMode) => void;
  setCarPosition: (position: CarPosition) => void;
  setCarRotation: (rotation: number) => void;
  setCarSpeed: (speed: number) => void;
};

const defaultContextValue: MapContextType = {
  selectedCity: null,
  drivingMode: 'free',
  mapApiKey: '',
  mapMode: 'mapbox',
  carPosition: { x: 400, y: 300 },
  carRotation: 0,
  carSpeed: 0,
  setSelectedCity: () => {},
  setDrivingMode: () => {},
  setMapApiKey: () => {},
  setMapMode: () => {},
  setCarPosition: () => {},
  setCarRotation: () => {},
  setCarSpeed: () => {},
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
        setSelectedCity,
        setDrivingMode,
        setMapApiKey,
        setMapMode,
        setCarPosition,
        setCarRotation,
        setCarSpeed,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
