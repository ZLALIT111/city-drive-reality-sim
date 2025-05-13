
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type MapLocation = {
  name: string;
  coordinates: [number, number];
  zoom: number;
};

export type DrivingMode = 'free' | 'route' | 'taxi' | 'bus' | 'educational';
export type MapMode = 'mapbox' | 'free';

export type MapContextType = {
  selectedCity: MapLocation | null;
  drivingMode: DrivingMode;
  mapApiKey: string;
  mapMode: MapMode;
  setSelectedCity: (city: MapLocation) => void;
  setDrivingMode: (mode: DrivingMode) => void;
  setMapApiKey: (key: string) => void;
  setMapMode: (mode: MapMode) => void;
};

const defaultContextValue: MapContextType = {
  selectedCity: null,
  drivingMode: 'free',
  mapApiKey: '',
  mapMode: 'mapbox',
  setSelectedCity: () => {},
  setDrivingMode: () => {},
  setMapApiKey: () => {},
  setMapMode: () => {},
};

export const MapContext = createContext<MapContextType>(defaultContextValue);

export const useMapContext = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<MapLocation | null>(null);
  const [drivingMode, setDrivingMode] = useState<DrivingMode>('free');
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [mapMode, setMapMode] = useState<MapMode>('mapbox');

  return (
    <MapContext.Provider
      value={{
        selectedCity,
        drivingMode,
        mapApiKey,
        mapMode,
        setSelectedCity,
        setDrivingMode,
        setMapApiKey,
        setMapMode,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
