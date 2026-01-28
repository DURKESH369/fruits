
import { Fruit } from './types';

export const INITIAL_FRUITS: Fruit[] = [
  {
    id: '1',
    name: 'Apple',
    scientificName: 'Malus domestica',
    description: 'A sweet, pomaceous fruit from the apple tree. High in fiber and Vitamin C.',
    origin: 'Central Asia',
    season: 'Autumn',
    benefits: ['Supports heart health', 'Good for weight loss', 'High in antioxidants'],
    nutrients: {
      calories: 52,
      sugar: 10,
      fiber: 2.4,
      vitaminC: 14,
      potassium: 107,
      protein: 0.3,
      carbs: 14
    },
    color: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'Mango',
    scientificName: 'Mangifera indica',
    description: 'Known as the "king of fruits," mangoes are juicy and tropical with a distinct sweetness.',
    origin: 'South Asia',
    season: 'Summer',
    benefits: ['Boosts immunity', 'Improves digestion', 'Supports eye health'],
    nutrients: {
      calories: 60,
      sugar: 14,
      fiber: 1.6,
      vitaminC: 60,
      potassium: 168,
      protein: 0.8,
      carbs: 15
    },
    color: 'bg-orange-400',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Avocado',
    scientificName: 'Persea americana',
    description: 'A creamy, high-fat fruit often treated as a vegetable. Packed with healthy monounsaturated fats.',
    origin: 'Mexico/Central America',
    season: 'Year-round',
    benefits: ['Heart healthy fats', 'High in potassium', 'Great for skin'],
    nutrients: {
      calories: 160,
      sugar: 0.7,
      fiber: 7,
      vitaminC: 17,
      potassium: 485,
      protein: 2,
      carbs: 8.5
    },
    color: 'bg-green-600',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80'
  }
];
