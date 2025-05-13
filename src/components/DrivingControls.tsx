
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  CarFront, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Route,
  TrafficCone
} from 'lucide-react';
import { useMapContext } from '../contexts/MapContext';

const DrivingControls: React.FC = () => {
  const { toast } = useToast();
  const { 
    setCarPosition, 
    carPosition, 
    carRotation, 
    setCarRotation, 
    setCarSpeed, 
    carSpeed,
    trafficLights
  } = useMapContext();
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const [virtualSteering, setVirtualSteering] = useState<number>(0);
  
  // Reset collision after a delay
  const [hasCollision, setHasCollision] = useState(false);
  
  // Check if the car is at a red light
  const isAtRedLight = useCallback(() => {
    return trafficLights.some(light => {
      const distance = Math.sqrt(
        Math.pow(light.x - carPosition.x, 2) + 
        Math.pow(light.y - carPosition.y, 2)
      );
      return distance < 30 && light.state === 'red';
    });
  }, [trafficLights, carPosition]);
  
  // Handle control button clicks with improved steering simulation
  const handleControl = useCallback((control: string) => {
    // Only show toast for deliberate actions, not continuous ones
    if (!['שמאלה', 'ימינה'].includes(control)) {
      toast({
        description: `פעולת נהיגה: ${control}`,
        duration: 1000,
      });
    }
    
    // If at red light and trying to move forward, warn
    if ((control === 'קדימה' || control === 'האץ') && isAtRedLight()) {
      toast({
        title: "רמזור אדום!",
        description: "אסור לעבור ברמזור אדום",
        variant: "destructive",
      });
      setHasCollision(true);
      setTimeout(() => setHasCollision(false), 2000);
      return;
    }
    
    // Update car based on control
    switch (control) {
      case 'קדימה':
        setCarSpeed(Math.min(carSpeed + 5, 60));
        break;
      case 'אחורה':
        setCarSpeed(Math.max(carSpeed - 5, -20));
        break;
      case 'שמאלה':
        // When turning, gradually change rotation based on speed
        setVirtualSteering(Math.max(-100, virtualSteering - 15));
        break;
      case 'ימינה':
        setVirtualSteering(Math.min(100, virtualSteering + 15));
        break;
      case 'עצור':
        setCarSpeed(0);
        setVirtualSteering(0);
        break;
      case 'האץ':
        setCarSpeed(Math.min(carSpeed + 10, 60));
        break;
      case 'בלום':
        setCarSpeed(Math.max(carSpeed - 10, -10));
        break;
      case 'איפוס':
        setVirtualSteering(0);
        break;
      default:
        break;
    }
  }, [carSpeed, virtualSteering, setCarSpeed, toast, isAtRedLight]);

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
      
      // When key released, start returning to center
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        handleControl('איפוס');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleControl]);

  // Steering control - returns the steering wheel to center over time
  useEffect(() => {
    if (virtualSteering !== 0 && !keysPressed.ArrowLeft && !keysPressed.ArrowRight) {
      const centeringInterval = setInterval(() => {
        setVirtualSteering(current => {
          if (Math.abs(current) < 5) return 0;
          return current > 0 ? current - 5 : current + 5;
        });
      }, 100);
      
      return () => clearInterval(centeringInterval);
    }
  }, [virtualSteering, keysPressed]);

  // Update car rotation based on steering and speed
  useEffect(() => {
    if (carSpeed === 0 || virtualSteering === 0) return;
    
    const steeringFactor = virtualSteering / 100;
    const speedFactor = Math.abs(carSpeed) / 20; // Higher speeds allow tighter turns
    
    const rotationInterval = setInterval(() => {
      // Reverse steering direction if going backwards
      const steeringDirection = carSpeed > 0 ? 1 : -1;
      setCarRotation(prev => prev + (steeringFactor * speedFactor * steeringDirection));
    }, 50);
    
    return () => clearInterval(rotationInterval);
  }, [virtualSteering, carSpeed, setCarRotation]);

  // Update car position based on speed and rotation
  useEffect(() => {
    if (carSpeed === 0) return;

    const moveInterval = setInterval(() => {
      const radians = (carRotation * Math.PI) / 180;
      const deltaX = Math.sin(radians) * (carSpeed / 5);
      const deltaY = -Math.cos(radians) * (carSpeed / 5);
      
      setCarPosition({
        x: Math.max(0, Math.min(800, carPosition.x + deltaX)),
        y: Math.max(0, Math.min(600, carPosition.y + deltaY))
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [carSpeed, carRotation, carPosition, setCarPosition]);
  
  // Add a subtle deceleration to simulate friction
  useEffect(() => {
    if (carSpeed === 0) return;
    
    const frictionInterval = setInterval(() => {
      setCarSpeed(speed => {
        if (Math.abs(speed) < 0.5) return 0;
        return speed > 0 ? speed - 0.2 : speed + 0.2;
      });
    }, 100);
    
    return () => clearInterval(frictionInterval);
  }, [carSpeed, setCarSpeed]);
  
  return (
    <div className={`bg-white bg-opacity-90 p-4 rounded-lg shadow-md ${hasCollision ? 'border-2 border-red-500' : ''}`}>
      <div className="text-center mb-2">
        <CarFront className="inline-block h-6 w-6" />
        <span className="mr-2 font-semibold">בקרת נהיגה</span>
      </div>
      
      {/* Speedometer */}
      <div className="mb-3 p-2 bg-gray-100 rounded">
        <div className="flex justify-between items-center">
          <span className="text-sm">מהירות</span>
          <span className="font-bold">{Math.abs(Math.round(carSpeed))} קמ"ש</span>
        </div>
        <div className="h-1.5 w-full bg-gray-300 rounded-full mt-1">
          <div 
            className={`h-full rounded-full ${carSpeed >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, Math.abs(carSpeed) / 0.6)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Steering indicator */}
      <div className="mb-3 p-2 bg-gray-100 rounded">
        <div className="flex justify-between items-center">
          <span className="text-sm">הגה</span>
          <span className="font-bold">{virtualSteering < 0 ? 'שמאלה' : virtualSteering > 0 ? 'ימינה' : 'ישר'}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-300 rounded-full mt-1 flex items-center">
          <div className="absolute h-3 w-3 rounded-full bg-black transition-all duration-150"
               style={{ 
                 left: `${Math.min(100, Math.max(0, 50 + virtualSteering / 2))}%`, 
                 transform: 'translateX(-50%)' 
               }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        <div className="col-start-2">
          <Button 
            variant={keysPressed.ArrowUp ? "default" : "outline"}
            size="icon" 
            className="w-full"
            onClick={() => handleControl('קדימה')}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant={keysPressed.ArrowLeft ? "default" : "outline"}
          size="icon" 
          className="w-full"
          onClick={() => handleControl('שמאלה')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="w-full bg-red-100"
          onClick={() => handleControl('עצור')}
        >
          <TrafficCone className="h-4 w-4" />
        </Button>
        
        <Button 
          variant={keysPressed.ArrowRight ? "default" : "outline"}
          size="icon" 
          className="w-full"
          onClick={() => handleControl('ימינה')}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <div className="col-start-2">
          <Button 
            variant={keysPressed.ArrowDown ? "default" : "outline"}
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
          className={`w-full bg-game-green hover:bg-game-green/80 ${keysPressed.Shift ? 'ring-2 ring-white' : ''}`}
          onClick={() => handleControl('האץ')}
        >
          האץ
        </Button>
        
        <Button 
          variant="default" 
          className={`w-full bg-game-red hover:bg-game-red/80 ${keysPressed[' '] ? 'ring-2 ring-white' : ''}`}
          onClick={() => handleControl('בלום')}
        >
          בלום
        </Button>
      </div>
      
      <div className="mt-3 text-xs text-center">
        <Route className="inline-block mr-1 h-3 w-3" />
        השתמש במקשי החיצים, Shift להאצה ורווח לבלימה
      </div>
    </div>
  );
};

export default DrivingControls;
