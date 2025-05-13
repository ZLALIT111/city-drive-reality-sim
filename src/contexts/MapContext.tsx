
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type MapLocation = {
  name: string;
  coordinates: [number, number];
  zoom: number;
};

export type DrivingMode = 'free' | 'route' | 'taxi' | 'bus' | 'educational';

export type MapContextType = {
  selectedCity: MapLocation | null;
  drivingMode: DrivingMode;
  mapApiKey: string;
  setSelectedCity: (city: MapLocation) => void;
  setDrivingMode: (mode: DrivingMode) => void;
  setMapApiKey: (key: string) => void;
};

const defaultContextValue: MapContextType = {
  selectedCity: null,
  drivingMode: 'free',
  mapApiKey: '',
  setSelectedCity: () => {},
  setDrivingMode: () => {},
  setMapApiKey: () => {},
};

export const MapContext = createContext<MapContextType>(defaultContextValue);

export const useMapContext = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<MapLocation | null>(null);
  const [drivingMode, setDrivingMode] = useState<DrivingMode>('free');
  const [mapApiKey, setMapApiKey] = useState<string>('');

  return (
    <MapContext.Provider
      value={{
        selectedCity,
        drivingMode,
        mapApiKey,
        setSelectedCity,
        setDrivingMode,
        setMapApiKey,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
