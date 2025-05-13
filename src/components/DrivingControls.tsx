
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  CarFront, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight 
} from 'lucide-react';

const DrivingControls: React.FC = () => {
  const { toast } = useToast();
  
  const handleControl = (control: string) => {
    toast({
      description: `פעולת נהיגה: ${control}`,
      duration: 1000,
    });
    
    // In a real implementation, this would send commands to the simulation
    console.log(`Driving control: ${control}`);
  };
  
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
