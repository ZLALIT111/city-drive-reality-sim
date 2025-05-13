
import React, { useState } from 'react';
import CityMap from '../components/CityMap';
import CitySelector from '../components/CitySelector';
import DrivingModeSelector from '../components/DrivingModeSelector';
import DrivingDashboard from '../components/DrivingDashboard';
import DrivingControls from '../components/DrivingControls';
import MapboxApiKeyInput from '../components/MapboxApiKeyInput';
import { useMapContext } from '../contexts/MapContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, MapPin } from 'lucide-react';

const Index = () => {
  const { selectedCity, mapApiKey, mapMode } = useMapContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const hasMapConfiguration = mapMode === 'free' || mapApiKey;

  if (!hasMapConfiguration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <MapboxApiKeyInput />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-md transition-all duration-300 overflow-y-auto
          ${isSidebarOpen ? 'w-72' : 'w-0'}
        `}
      >
        {isSidebarOpen && (
          <div>
            <div className="p-4 border-b">
              <h1 className="text-2xl font-bold text-game-blue">סימולטור נהיגה</h1>
              <p className="text-sm text-gray-500">נהג בערים אמיתיות</p>
              {mapMode === 'free' && (
                <div className="mt-1 text-xs bg-blue-50 text-blue-600 p-1 rounded">
                  מצב מפה חינמית
                </div>
              )}
            </div>
            
            <Tabs defaultValue="city">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="city">
                  <MapPin className="h-4 w-4 ml-2" />
                  ערים
                </TabsTrigger>
                <TabsTrigger value="mode">
                  <Car className="h-4 w-4 ml-2" />
                  מצבי נהיגה
                </TabsTrigger>
              </TabsList>
              <TabsContent value="city">
                <CitySelector />
              </TabsContent>
              <TabsContent value="mode">
                <DrivingModeSelector />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Toggle Button */}
        <button
          className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          )}
        </button>
        
        {/* Map Container */}
        <div className="flex-1 relative">
          <CityMap />
          
          {/* Overlays */}
          {selectedCity && (
            <>
              {/* Dashboard */}
              <div className="absolute top-4 left-4 w-72 z-10">
                <DrivingDashboard />
              </div>
              
              {/* Controls */}
              <div className="absolute bottom-4 left-4 z-10">
                <DrivingControls />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
