// src/types/index.ts
// Includes all services as a constant array + type safety

export interface User {
  id: number;
  name: string;
  phoneNumber: string;
  inQueue?: boolean;
  queuedBarberId?: number;
}

export interface Barber {
  id: number;
  name: string;
  username: string;
  lat: number;
  long: number;
  distanceKm?: number;
  queueLength?: number;
  estimatedWaitTime?: number; // in minutes
}

export interface QueueEntry {
  id: number;
  enteredAt: string;
  barberId: number;
  userId: number;
  service: ServiceType; // refers to one of the service ids
  user: {
    id: number;
    name: string;
  };
}

export interface AuthResponse {
  user?: User;
  barber?: Barber;
  token: string;
  msg: string;
}

export interface ApiError {
  error?: string;
  msg?: string;
}

export type UserRole = "USER" | "BARBER";

export interface AuthContextType {
  user: User | null;
  barber: Barber | null;
  token: string | null;
  role: UserRole | null;
  login: (
    phoneOrUsername: string,
    password?: string,
    role?: UserRole
  ) => Promise<void>;
  signup: (data: SignupData, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface SignupData {
  name: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  username?: string;
  lat?: number;
  long?: number;
}

export interface LoginData {
  phoneNumber?: string;
  email?: string;
  username?: string;
  password?: string;
}

// --------------------
// Services
// --------------------
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  description: string;
  category: string;
  priceRange?: string;
}

// List of all services
export const SERVICES: Service[] = [
  // Haircuts & Styling
  { id: "classic-haircut", name: "Classic Haircut", price: 2660, duration: 20, description: "Basic haircut for men", category: "Haircuts & Styling", priceRange: "₹2,050 - ₹3,280" },
  { id: "skin-fade", name: "Skin Fade / Taper Fade", price: 3080, duration: 25, description: "Modern fade styles", category: "Haircuts & Styling", priceRange: "₹2,460 - ₹3,690" },
  { id: "crew-buzz", name: "Crew Cut / Buzz Cut", price: 2050, duration: 15, description: "Short crew/buzz cut", category: "Haircuts & Styling", priceRange: "₹1,640 - ₹2,460" },
  { id: "scissor-cut", name: "Scissor Cut (Traditional)", price: 3080, duration: 25, description: "Classic scissor haircut", category: "Haircuts & Styling", priceRange: "₹2,460 - ₹3,690" },
  { id: "beard-trim", name: "Beard Trim", price: 1640, duration: 10, description: "Beard trimming and shaping", category: "Haircuts & Styling", priceRange: "₹1,230 - ₹2,050" },
  { id: "haircut-beard-combo", name: "Haircut + Beard Combo", price: 4100, duration: 35, description: "Complete haircut and beard service", category: "Haircuts & Styling", priceRange: "₹3,280 - ₹4,920" },
  { id: "styling-blowdry", name: "Styling / Blow-Dry", price: 1640, duration: 10, description: "Hair styling and blow-dry", category: "Haircuts & Styling", priceRange: "₹1,230 - ₹2,050" },

  // Shaves & Grooming
  { id: "hot-towel-shave", name: "Hot Towel Shave", price: 3080, duration: 25, description: "Traditional hot towel shave", category: "Shaves & Grooming", priceRange: "₹2,460 - ₹3,690" },
  { id: "head-shave", name: "Head Shave (Razor)", price: 2660, duration: 20, description: "Clean razor head shave", category: "Shaves & Grooming", priceRange: "₹2,050 - ₹3,280" },
  { id: "beard-shaping", name: "Beard Shaping + Line-Up", price: 2050, duration: 15, description: "Detailed beard shaping", category: "Shaves & Grooming", priceRange: "₹1,640 - ₹2,460" },
  { id: "mustache-trim", name: "Mustache Trim", price: 1020, duration: 5, description: "Mustache trimming", category: "Shaves & Grooming", priceRange: "₹820 - ₹1,230" },

  // Treatments
  { id: "scalp-massage", name: "Scalp Massage & Wash", price: 1640, duration: 15, description: "Relaxing scalp massage & wash", category: "Treatments", priceRange: "₹1,230 - ₹2,050" },
  { id: "hair-color", name: "Hair Color (Grey Coverage)", price: 4100, duration: 40, description: "Grey coverage hair coloring", category: "Treatments", priceRange: "₹3,280 - ₹4,920" },
  { id: "beard-dye", name: "Beard Dye", price: 2460, duration: 20, description: "Beard dyeing", category: "Treatments", priceRange: "₹2,050 - ₹2,870" },
  { id: "hair-spa", name: "Hair Spa / Deep Conditioning", price: 2260, duration: 30, description: "Deep conditioning hair spa", category: "Treatments", priceRange: "₹1,640 - ₹2,870" },

  // Combo Packs
  { id: "gentlemans", name: "Gentleman’s Package", price: 5740, duration: 60, description: "Haircut + Beard Trim + Hot Towel Finish", category: "Combo Packs", priceRange: "₹4,920 - ₹6,560" },
  { id: "executive", name: "Executive Package", price: 6560, duration: 70, description: "Haircut + Beard Shaping + Hair Wash + Styling", category: "Combo Packs", priceRange: "₹5,740 - ₹7,380" },
  { id: "royal-shave-package", name: "Royal Shave Package", price: 7180, duration: 75, description: "Haircut + Hot Towel Shave + Scalp Massage", category: "Combo Packs", priceRange: "₹6,150 - ₹8,200" },
  { id: "kings-luxury", name: "King’s Luxury Package", price: 8610, duration: 90, description: "Haircut + Beard Trim + Hair Spa + Scalp Massage", category: "Combo Packs", priceRange: "₹7,380 - ₹9,840" },
];

// Type for service ids (automatically inferred from SERVICES)
export type ServiceType = typeof SERVICES[number]["id"];
