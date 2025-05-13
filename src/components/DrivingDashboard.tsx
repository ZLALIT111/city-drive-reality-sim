
import React from 'react';
import { useMapContext } from '../contexts/MapContext';
import { Progress } from '@/components/ui/progress';
import { Car, Navigation } from 'lucide-react';

const DrivingDashboard: React.FC = () => {
  const { drivingMode, selectedCity } = useMapContext();
  const [speed, setSpeed] = React.useState(0);
  const [score, setScore] = React.useState(100);
  
  // Simulate real-time driving data
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Random speed between 0-60 km/h
      setSpeed(Math.floor(Math.random() * 60));
      
      // Random score fluctuations between 90-100
      setScore(Math.max(90, Math.min(100, score + (Math.random() * 2 - 1))));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [score]);
  
  const formatModeText = (mode: string) => {
    switch(mode) {
      case 'free': return 'נהיגה חופשית';
      case 'route': return 'נהיגה לפי מסלול';
      case 'taxi': return 'מצב מונית';
      case 'bus': return 'מצב אוטובוס';
      case 'educational': return 'מצב חינוכי';
      default: return mode;
    }
  };
  
  return (
    <div className="bg-gray-100 bg-opacity-80 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-sm text-gray-600">מיקום נוכחי</p>
          <p className="font-bold">{selectedCity?.name || 'לא ידוע'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">מצב נהיגה</p>
          <p className="font-bold">{formatModeText(drivingMode)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-white p-3 rounded-md">
          <div className="flex items-center justify-between">
            <p>מהירות</p>
            <Car className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">{speed} <span className="text-sm">קמ"ש</span></p>
          <Progress value={speed / 0.6} className="h-1 mt-1" />
        </div>
        
        <div className="bg-white p-3 rounded-md">
          <div className="flex items-center justify-between">
            <p>ניקוד בטיחות</p>
            <Navigation className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">{Math.round(score)}</p>
          <Progress value={score} className="h-1 mt-1" />
        </div>
      </div>
      
      <div className="text-xs text-center text-gray-500">
        השתמש במקשי החיצים לנהיגה, Shift להאצה, רווח לבלימה
      </div>
    </div>
  );
};

export default DrivingDashboard;
