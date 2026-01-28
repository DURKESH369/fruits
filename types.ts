
export interface Nutrients {
  calories: number;
  sugar: number;
  fiber: number;
  vitaminC: number;
  potassium: number;
  protein: number;
  carbs: number;
}

export interface Fruit {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  origin: string;
  season: string;
  benefits: string[];
  nutrients: Nutrients;
  color: string;
  image: string;
  price?: number; // Price per kg
  isForSale?: boolean;
  sellerName?: string;
}

export interface CartItem {
  fruitId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type View = 'home' | 'details' | 'identify' | 'assistant' | 'favorites' | 'market' | 'admin';
