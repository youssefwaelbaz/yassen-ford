export interface FordCar {
  id: string;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  category: 'sports' | 'suvs-crossovers' | 'trucks' | 'sedans';
  categoryAr: string;
  priceStartAr: string; // e.g. "٢٤٥,٠٠٠ ريال"
  priceEstimate: number; // in SAR
  engine: string;
  engineAr: string;
  horsepower: number;
  torque: string;
  acceleration: string; // 0-100 km/h
  transmission: string;
  transmissionAr: string;
  driveTypeAr: string; // دفع خلفي، كلي، رباعي
  fuelEconomyAr: string; // e.g. "١٢.٥ كم/لتر"
  fuelTypeAr: string; // بنزين، كهربائي، هجين
  seats: number;
  descriptionAr: string;
  featuresAr: string[];
  colors: { name: string; hex: string; nameEn: string }[];
  image: string; // Standard default or generated stock representations
  bannerImage: string;
  performanceScore: number; // 1-100
  utilityScore: number; // 1-100
  techScore: number; // 1-100
}

export interface CustomizedCar {
  car: FordCar;
  selectedColor: { name: string; hex: string; nameEn: string };
  selectedWheels: { name: string; price: number };
  selectedPackage: { name: string; description: string; price: number };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SparePart {
  id: string;
  name: string;
  category: 'engine' | 'brakes' | 'filters' | 'suspension' | 'accessories' | 'electrical';
  categoryAr: string;
  carModel: string; // e.g., 'fusion' | 'focus' | 'bronco' | 'mustang' | 'all'
  carModelAr: string;
  condition: 'new' | 'used';
  conditionAr: string;
  price: number; // in EGP
  priceAr: string;
  descriptionAr: string;
  sellerName: string;
  sellerPhone: string;
  image: string;
  isVerified?: boolean;
}

