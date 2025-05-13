
import { MapLocation } from '../contexts/MapContext';

export const popularCities: MapLocation[] = [
  {
    name: 'תל אביב',
    coordinates: [34.781769, 32.085300],
    zoom: 13
  },
  {
    name: 'ירושלים',
    coordinates: [35.2137, 31.7683],
    zoom: 13
  },
  {
    name: 'חיפה',
    coordinates: [34.9896, 32.7940],
    zoom: 13
  },
  {
    name: 'באר שבע',
    coordinates: [34.7913, 31.2518],
    zoom: 13
  },
  {
    name: 'אילת',
    coordinates: [34.9482, 29.5577],
    zoom: 13
  },
  {
    name: 'רמת גן',
    coordinates: [34.8100, 32.0823],
    zoom: 14
  },
];

export const drivingModes = [
  { id: 'free', name: 'נסיעה חופשית', description: 'נהג חופשי בעיר ללא מגבלות' },
  { id: 'route', name: 'מסלול מוגדר', description: 'סע ממקום למקום לפי מסלול מוגדר' },
  { id: 'taxi', name: 'סימולטור מונית', description: 'התנסה כנהג מונית ואסוף נוסעים' },
  { id: 'bus', name: 'נהג אוטובוס', description: 'נהג באוטובוס בקו קבוע ואסוף נוסעים' },
  { id: 'educational', name: 'מצב חינוכי', description: 'למד על בטיחות בדרכים וכללי נהיגה' }
];
