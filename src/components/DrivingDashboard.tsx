
import React, { useEffect, useState } from 'react';
import { useMapContext } from '../contexts/MapContext';
import { Progress } from '@/components/ui/progress';
import { CarFront, Navigation, SignpostBig } from 'lucide-react';

const DrivingDashboard: React.FC = () => {
  const { drivingMode, selectedCity, carSpeed, trafficLights, roadSigns } = useMapContext();
  const [safetyScore, setSafetyScore] = useState(100);
  const [violations, setViolations] = useState<string[]>([]);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  
  // Update safety score based on driving behavior
  useEffect(() => {
    // Add distance traveled as car moves
    if (Math.abs(carSpeed) > 0) {
      const interval = setInterval(() => {
        setDistanceTraveled(prev => prev + Math.abs(carSpeed) / 360); // in km
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [carSpeed]);
  
  // Record violations and update safety score
  useEffect(() => {
    // Check for speeding in certain areas
    const nearSpeedLimit = roadSigns.find(sign => {
      return sign.type === 'speed-limit';
    });
    
    const violations: string[] = [];
    let deduction = 0;
    
    // Extreme speeding
    if (carSpeed > 70) {
      violations.push("מהירות מופרזת מאוד");
      deduction += 20;
    } else if (carSpeed > 50) {
      violations.push("מהירות מופרזת");
      deduction += 10;
    }
    
    // Speeding in a speed limit zone
    if (nearSpeedLimit && carSpeed > (nearSpeedLimit.value || 50)) {
      violations.push(`חריגה ממגבלת מהירות (${nearSpeedLimit.value})`);
      deduction += 15;
    }
    
    // Compute new safety score
    setSafetyScore(prev => {
      const newScore = Math.max(0, Math.min(100, prev - deduction * 0.05));
      return newScore;
    });
    
    setViolations(violations);
    
    // Score recovery over time
    const recoverInterval = setInterval(() => {
      setSafetyScore(prev => Math.min(100, prev + 0.05));
    }, 1000);
    
    return () => clearInterval(recoverInterval);
  }, [carSpeed, roadSigns]);
  
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
    <div className="bg-white bg-opacity-80 p-4 rounded-lg shadow-md">
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
        <div className="bg-gray-100 p-3 rounded-md">
          <div className="flex items-center justify-between">
            <p>מהירות</p>
            <CarFront className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold">{Math.abs(Math.round(carSpeed))} <span className="text-sm">קמ"ש</span></p>
          <Progress 
            value={Math.min(100, Math.abs(carSpeed) / 0.6)} 
            className={`h-1 mt-1 ${carSpeed < 0 ? 'bg-red-200' : ''}`} 
          />
          <p className="text-xs text-gray-500 mt-1">
            {carSpeed > 0 ? 'נסיעה קדימה' : carSpeed < 0 ? 'נסיעה לאחור' : 'עצירה'}
          </p>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-md">
          <div className="flex items-center justify-between">
            <p>ניקוד בטיחות</p>
            <Navigation className="h-4 w-4" />
          </div>
          <p className={`text-2xl font-bold ${safetyScore < 70 ? 'text-red-500' : safetyScore < 90 ? 'text-yellow-500' : ''}`}>
            {Math.round(safetyScore)}
          </p>
          <Progress 
            value={safetyScore} 
            className={`h-1 mt-1 ${
              safetyScore < 50 ? 'bg-red-500' : 
              safetyScore < 70 ? 'bg-orange-400' : 
              safetyScore < 90 ? 'bg-yellow-400' : 
              'bg-green-500'
            }`} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-gray-100 p-3 rounded-md">
          <div className="flex items-center justify-between">
            <p>מרחק נסיעה</p>
            <SignpostBig className="h-4 w-4" />
          </div>
          <p className="text-lg font-bold">{distanceTraveled.toFixed(2)} <span className="text-xs">ק"מ</span></p>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-md">
          <div className="flex items-center justify-between">
            <p>מספר עבירות</p>
            <CarFront className="h-4 w-4" />
          </div>
          <p className="text-lg font-bold">{violations.length}</p>
        </div>
      </div>
      
      {violations.length > 0 && (
        <div className="bg-red-50 p-2 rounded mt-2 text-xs text-red-600">
          <p className="font-bold mb-1">עבירות אחרונות:</p>
          <ul className="list-disc list-inside">
            {violations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DrivingDashboard;
