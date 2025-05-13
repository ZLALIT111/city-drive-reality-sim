
import { useState } from 'react';
import { useMapContext } from '../contexts/MapContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MapboxApiKeyInput = () => {
  const { mapApiKey, setMapApiKey, setMapMode } = useMapContext();
  const [inputKey, setInputKey] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (inputKey.trim()) {
      setMapApiKey(inputKey.trim());
      setMapMode('mapbox');
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

  const handleUseFreeMap = () => {
    setMapMode('free');
    toast({
      title: "מפה חינמית נבחרה",
      description: "כעת תוכל להשתמש במפת הדמה החינמית",
    });
  };

  if (mapApiKey) return null; // Hide if API key is already set

  return (
    <Card className="w-[450px] max-w-full">
      <CardHeader>
        <CardTitle>בחר סוג מפה</CardTitle>
        <CardDescription>
          בחר בין מפה אמיתית הדורשת מפתח API או מפת דמה חינמית
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mapbox" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="mapbox">מפות אמיתיות (Mapbox)</TabsTrigger>
            <TabsTrigger value="free">מפת דמה חינמית</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mapbox">
            <div className="space-y-4 mt-4">
              <p className="text-sm">
                צור חשבון ב-<a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Mapbox</a> וקבל מפתח API ציבורי מלוח המחוונים שלך
              </p>
              <Input
                placeholder="הכנס את מפתח ה-API הציבורי של Mapbox"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
              <Button onClick={handleSubmit} className="w-full">
                הגדר מפתח API
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="free">
            <div className="space-y-4 mt-4">
              <p className="text-sm">
                השתמש במפת דמה חינמית ללא צורך במפתח API. המפה היא פשוטה אך מספקת את כל הפונקציונליות הבסיסית.
              </p>
              <Button onClick={handleUseFreeMap} className="w-full">
                השתמש במפה חינמית
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MapboxApiKeyInput;
