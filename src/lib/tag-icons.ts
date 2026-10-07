import type { LucideIcon } from 'lucide-react';
import {
  HelpCircle,
  ShoppingCart,
  Utensils,
  Coffee,
  Pizza,
  Apple,
  Wine,
  Home,
  Zap,
  Wifi,
  Tv,
  Flame,
  Droplet,
  Wrench,
  Car,
  Bus,
  Fuel,
  Plane,
  Train,
  Bike,
  HeartPulse,
  Pill,
  Dumbbell,
  Smile,
  Film,
  Gamepad2,
  Music,
  Ticket,
  PartyPopper,
  CreditCard,
  Wallet,
  Banknote,
  Briefcase,
  Laptop,
  Gift,
  ShoppingBag,
  Tag as TagIconLucide,
  BookOpen,
  GraduationCap,
  PawPrint,
  Baby,
} from 'lucide-react';

export interface TagIconItem {
  name: string;
  label: string;
  category: string;
  icon: LucideIcon;
}

export const DEFAULT_TAG_ICON: LucideIcon = HelpCircle;
export const DEFAULT_TAG_ICON_NAME = 'HelpCircle';

export const TAG_ICONS_LIST: TagIconItem[] = [
  // Comida y Supermercado
  { name: 'ShoppingCart', label: 'Supermercado', category: 'Alimentos', icon: ShoppingCart },
  { name: 'Utensils', label: 'Restaurante', category: 'Alimentos', icon: Utensils },
  { name: 'Coffee', label: 'Cafetería', category: 'Alimentos', icon: Coffee },
  { name: 'Pizza', label: 'Comida Rápida', category: 'Alimentos', icon: Pizza },
  { name: 'Apple', label: 'Verdulería / Fruta', category: 'Alimentos', icon: Apple },
  { name: 'Wine', label: 'Bebidas / Bar', category: 'Alimentos', icon: Wine },

  // Hogar y Servicios
  { name: 'Home', label: 'Hogar / Alquiler', category: 'Hogar', icon: Home },
  { name: 'Zap', label: 'Electricidad / Luz', category: 'Hogar', icon: Zap },
  { name: 'Wifi', label: 'Internet', category: 'Hogar', icon: Wifi },
  { name: 'Tv', label: 'Streaming / TV', category: 'Hogar', icon: Tv },
  { name: 'Flame', label: 'Gas', category: 'Hogar', icon: Flame },
  { name: 'Droplet', label: 'Agua', category: 'Hogar', icon: Droplet },
  { name: 'Wrench', label: 'Mantenimiento', category: 'Hogar', icon: Wrench },

  // Transporte y Viajes
  { name: 'Car', label: 'Auto / Vehículo', category: 'Transporte', icon: Car },
  { name: 'Fuel', label: 'Combustible', category: 'Transporte', icon: Fuel },
  { name: 'Bus', label: 'Transporte Público', category: 'Transporte', icon: Bus },
  { name: 'Train', label: 'Tren / Subte', category: 'Transporte', icon: Train },
  { name: 'Plane', label: 'Vuelos / Viajes', category: 'Transporte', icon: Plane },
  { name: 'Bike', label: 'Bicicleta', category: 'Transporte', icon: Bike },

  // Salud y Cuidado Personal
  { name: 'HeartPulse', label: 'Salud / Farmacia', category: 'Salud', icon: HeartPulse },
  { name: 'Pill', label: 'Medicamentos', category: 'Salud', icon: Pill },
  { name: 'Dumbbell', label: 'Gimnasio / Deporte', category: 'Salud', icon: Dumbbell },
  { name: 'Smile', label: 'Cuidado Personal', category: 'Salud', icon: Smile },

  // Ocio y Entretenimiento
  { name: 'Film', label: 'Cine / Salidas', category: 'Ocio', icon: Film },
  { name: 'Gamepad2', label: 'Videojuegos', category: 'Ocio', icon: Gamepad2 },
  { name: 'Music', label: 'Música / Conciertos', category: 'Ocio', icon: Music },
  { name: 'Ticket', label: 'Eventos', category: 'Ocio', icon: Ticket },
  { name: 'PartyPopper', label: 'Fiesta / Celebración', category: 'Ocio', icon: PartyPopper },

  // Finanzas y Trabajo
  { name: 'CreditCard', label: 'Tarjeta de Crédito', category: 'Finanzas', icon: CreditCard },
  { name: 'Wallet', label: 'Billetera', category: 'Finanzas', icon: Wallet },
  { name: 'Banknote', label: 'Efectivo', category: 'Finanzas', icon: Banknote },
  { name: 'Briefcase', label: 'Trabajo', category: 'Finanzas', icon: Briefcase },
  { name: 'Laptop', label: 'Tecnología / Software', category: 'Finanzas', icon: Laptop },

  // Compras y Varios
  { name: 'ShoppingBag', label: 'Compras / Ropa', category: 'Compras', icon: ShoppingBag },
  { name: 'Gift', label: 'Regalos', category: 'Compras', icon: Gift },
  { name: 'Tag', label: 'Etiqueta General', category: 'Compras', icon: TagIconLucide },
  { name: 'BookOpen', label: 'Libros', category: 'Educación', icon: BookOpen },
  { name: 'GraduationCap', label: 'Educación / Cursos', category: 'Educación', icon: GraduationCap },
  { name: 'PawPrint', label: 'Mascotas', category: 'Varios', icon: PawPrint },
  { name: 'Baby', label: 'Bebé / Hijos', category: 'Varios', icon: Baby },
  { name: 'HelpCircle', label: 'Otro / General', category: 'Varios', icon: HelpCircle },
];

export const TAG_ICONS_MAP: Record<string, LucideIcon> = TAG_ICONS_LIST.reduce(
  (acc, item) => {
    acc[item.name] = item.icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);
