
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  CarFront, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight 
} from 'lucide-react';
import { useMapContext } from '../contexts/MapContext';

const DrivingControls: React.FC = () => {
  const { toast } = useToast();
  const { setCarPosition, carPosition, carRotation, setCarRotation, setCarSpeed, carSpeed } = useMapContext();
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  
  // Handle control button clicks
  const handleControl = (control: string) => {
    toast({
      description: `פעולת נהיגה: ${control}`,
      duration: 1000,
    });
    
    // Update car based on control
    switch (control) {
      case 'קדימה':
        setCarSpeed(Math.min(carSpeed + 5, 60));
        break;
      case 'אחורה':
        setCarSpeed(Math.max(carSpeed - 5, -20));
        break;
      case 'שמאלה':
        setCarRotation(carRotation - 15);
        break;
      case 'ימינה':
        setCarRotation(carRotation + 15);
        break;
      case 'עצור':
        setCarSpeed(0);
        break;
      case 'האץ':
        setCarSpeed(Math.min(carSpeed + 10, 60));
        break;
      case 'בלום':
        setCarSpeed(Math.max(carSpeed - 10, 0));
        break;
      default:
        break;
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keysPressed[e.key]) return;

      setKeysPressed(prev => ({ ...prev, [e.key]: true }));
      
      switch (e.key) {
        case 'ArrowUp':
          handleControl('קדימה');
          break;
        case 'ArrowDown':
          handleControl('אחורה');
          break;
        case 'ArrowLeft':
          handleControl('שמאלה');
          break;
        case 'ArrowRight':
          handleControl('ימינה');
          break;
        case ' ': // Space bar
          handleControl('בלום');
          break;
        case 'Shift':
          handleControl('האץ');
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [carRotation, carSpeed]);

  // Update car position based on speed and rotation
  useEffect(() => {
    if (carSpeed === 0) return;

    const moveInterval = setInterval(() => {
      const radians = (carRotation * Math.PI) / 180;
      const deltaX = Math.sin(radians) * (carSpeed / 5);
      const deltaY = -Math.cos(radians) * (carSpeed / 5);
      
      setCarPosition({
        x: carPosition.x + deltaX,
        y: carPosition.y + deltaY
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [carSpeed, carRotation, carPosition]);
  
  return (
    <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-md">
      <div className="text-center mb-2">
        <CarFront className="inline-block h-6 w-6" />
        <span className="ml-2 font-semibold">בקרת נהיגה</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        <div className="col-start-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-full"
            onClick={() => handleControl('קדימה')}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="w-full"
          onClick={() => handleControl('שמאלה')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="w-full"
          onClick={() => handleControl('עצור')}
        >
          <div className="h-1 w-4 bg-black" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="w-full"
          onClick={() => handleControl('ימינה')}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <div className="col-start-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-full"
            onClick={() => handleControl('אחורה')}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button 
          variant="default" 
          className="w-full bg-game-green hover:bg-game-green/80"
          onClick={() => handleControl('האץ')}
        >
          האץ
        </Button>
        
        <Button 
          variant="default" 
          className="w-full bg-game-red hover:bg-game-red/80"
          onClick={() => handleControl('בלום')}
        >
          בלום
        </Button>
      </div>
    </div>
  );
};

export default DrivingControls;
