
import { useMapContext } from '../contexts/MapContext';
import { drivingModes } from '../data/cities';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Route, Navigation, Bus } from 'lucide-react';

const DrivingModeSelector = () => {
  const { setDrivingMode, drivingMode } = useMapContext();
  
  // Map of mode IDs to their icons
  const modeIcons: Record<string, React.ReactNode> = {
    free: <Car className="h-5 w-5 text-game-blue" />,
    route: <Route className="h-5 w-5 text-game-green" />,
    taxi: <Car className="h-5 w-5 text-game-yellow" />,
    bus: <Bus className="h-5 w-5 text-game-red" />,
    educational: <Navigation className="h-5 w-5 text-game-dark-blue" />
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">בחר מצב נהיגה</h2>
      
      <div className="space-y-3">
        {drivingModes.map((mode) => (
          <Card
            key={mode.id}
            className={`cursor-pointer transition-all ${
              drivingMode === mode.id
                ? 'border-game-blue border-2'
                : 'hover:border-game-light-blue'
            }`}
            onClick={() => setDrivingMode(mode.id as any)}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{mode.name}</p>
                <p className="text-sm text-gray-500">{mode.description}</p>
              </div>
              <div>{modeIcons[mode.id]}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DrivingModeSelector;
