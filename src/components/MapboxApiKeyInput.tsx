
import { useState } from 'react';
import { useMapContext } from '../contexts/MapContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const MapboxApiKeyInput = () => {
  const { mapApiKey, setMapApiKey } = useMapContext();
  const [inputKey, setInputKey] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (inputKey.trim()) {
      setMapApiKey(inputKey.trim());
      toast({
        title: "מפתח API הוגדר",
        description: "כעת תוכל להשתמש במפות",
      });
    } else {
      toast({
        title: "שגיאה",
        description: "אנא הכנס מפתח API תקין",
        variant: "destructive",
      });
    }
  };

  if (mapApiKey) return null; // Hide if API key is already set

  return (
    <Card className="w-[450px] max-w-full">
      <CardHeader>
        <CardTitle>הגדרת מפתח API של Mapbox</CardTitle>
        <CardDescription>
          כדי להשתמש במפות אמיתיות, אנחנו צריכים מפתח API של Mapbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            צור חשבון ב-<a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Mapbox</a> וקבל מפתח API ציבורי מלוח המחוונים שלך
          </p>
          <Input
            placeholder="הכנס את מפתח ה-API הציבורי של Mapbox"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          הגדר מפתח API
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MapboxApiKeyInput;
