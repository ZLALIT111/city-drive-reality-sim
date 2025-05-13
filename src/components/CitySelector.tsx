
import { useState } from 'react';
import { useMapContext } from '../contexts/MapContext';
import { popularCities } from '../data/cities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const CitySelector = () => {
  const { setSelectedCity, selectedCity } = useMapContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = popularCities.filter((city) => 
    city.name.includes(searchQuery)
  );
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">בחר עיר</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="חפש עיר..."
          className="w-full p-2 border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {filteredCities.map((city) => (
          <Card
            key={city.name}
            className={`cursor-pointer transition-all ${
              selectedCity?.name === city.name
                ? 'border-game-blue border-2'
                : 'hover:border-game-light-blue'
            }`}
            onClick={() => setSelectedCity(city)}
          >
            <CardContent className="p-3 flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-game-blue" />
              <span>{city.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            // This would open a file upload dialog in a real implementation
            alert('פונקציונליות העלאת מפה מותאמת אישית תתווסף בגרסה הבאה');
          }}
        >
          העלה מפה מותאמת אישית
        </Button>
      </div>
    </div>
  );
};

export default CitySelector;
