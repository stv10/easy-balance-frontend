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
  defaultColor: string;
}

export const DEFAULT_TAG_ICON: LucideIcon = HelpCircle;
export const DEFAULT_TAG_ICON_NAME = 'HelpCircle';
export const DEFAULT_TAG_COLOR = '#3B82F6';
export const UNTAGGED_COLOR = '#94A3B8';

export const TAG_SWATCHES = [
  { hex: '#EF4444', className: 'bg-red-500', name: 'Rojo' },
  { hex: '#F97316', className: 'bg-orange-500', name: 'Naranja' },
  { hex: '#F59E0B', className: 'bg-amber-500', name: 'Ámbar' },
  { hex: '#84CC16', className: 'bg-lime-500', name: 'Lima' },
  { hex: '#10B981', className: 'bg-emerald-500', name: 'Esmeralda' },
  { hex: '#14B8A6', className: 'bg-teal-500', name: 'Verde azulado' },
  { hex: '#0EA5E9', className: 'bg-sky-500', name: 'Celeste' },
  { hex: '#3B82F6', className: 'bg-blue-500', name: 'Azul' },
  { hex: '#6366F1', className: 'bg-indigo-500', name: 'Índigo' },
  { hex: '#8B5CF6', className: 'bg-violet-500', name: 'Violeta' },
  { hex: '#EC4899', className: 'bg-pink-500', name: 'Rosa' },
  { hex: '#F43F5E', className: 'bg-rose-500', name: 'Rosa intenso' },
  { hex: '#06B6D4', className: 'bg-cyan-500', name: 'Cian' },
  { hex: '#D946EF', className: 'bg-fuchsia-500', name: 'Fucsia' },
  { hex: '#EAB308', className: 'bg-yellow-500', name: 'Amarillo' },
  { hex: '#64748B', className: 'bg-slate-500', name: 'Pizarra' },
] as const;

export const TAG_ICONS_LIST: TagIconItem[] = [
  // Comida y Supermercado
  { name: 'ShoppingCart', label: 'Supermercado', category: 'Alimentos', icon: ShoppingCart, defaultColor: '#10B981' },
  { name: 'Utensils', label: 'Restaurante', category: 'Alimentos', icon: Utensils, defaultColor: '#F97316' },
  { name: 'Coffee', label: 'Cafetería', category: 'Alimentos', icon: Coffee, defaultColor: '#F59E0B' },
  { name: 'Pizza', label: 'Comida Rápida', category: 'Alimentos', icon: Pizza, defaultColor: '#EF4444' },
  { name: 'Apple', label: 'Verdulería / Fruta', category: 'Alimentos', icon: Apple, defaultColor: '#84CC16' },
  { name: 'Wine', label: 'Bebidas / Bar', category: 'Alimentos', icon: Wine, defaultColor: '#EC4899' },

  // Hogar y Servicios
  { name: 'Home', label: 'Hogar / Alquiler', category: 'Hogar', icon: Home, defaultColor: '#3B82F6' },
  { name: 'Zap', label: 'Electricidad / Luz', category: 'Hogar', icon: Zap, defaultColor: '#EAB308' },
  { name: 'Wifi', label: 'Internet', category: 'Hogar', icon: Wifi, defaultColor: '#0EA5E9' },
  { name: 'Tv', label: 'Streaming / TV', category: 'Hogar', icon: Tv, defaultColor: '#8B5CF6' },
  { name: 'Flame', label: 'Gas', category: 'Hogar', icon: Flame, defaultColor: '#F97316' },
  { name: 'Droplet', label: 'Agua', category: 'Hogar', icon: Droplet, defaultColor: '#06B6D4' },
  { name: 'Wrench', label: 'Mantenimiento', category: 'Hogar', icon: Wrench, defaultColor: '#64748B' },

  // Transporte y Viajes
  { name: 'Car', label: 'Auto / Vehículo', category: 'Transporte', icon: Car, defaultColor: '#3B82F6' },
  { name: 'Fuel', label: 'Combustible', category: 'Transporte', icon: Fuel, defaultColor: '#EF4444' },
  { name: 'Bus', label: 'Transporte Público', category: 'Transporte', icon: Bus, defaultColor: '#F59E0B' },
  { name: 'Train', label: 'Tren / Subte', category: 'Transporte', icon: Train, defaultColor: '#6366F1' },
  { name: 'Plane', label: 'Vuelos / Viajes', category: 'Transporte', icon: Plane, defaultColor: '#0EA5E9' },
  { name: 'Bike', label: 'Bicicleta', category: 'Transporte', icon: Bike, defaultColor: '#10B981' },

  // Salud y Cuidado Personal
  { name: 'HeartPulse', label: 'Salud / Farmacia', category: 'Salud', icon: HeartPulse, defaultColor: '#F43F5E' },
  { name: 'Pill', label: 'Medicamentos', category: 'Salud', icon: Pill, defaultColor: '#EC4899' },
  { name: 'Dumbbell', label: 'Gimnasio / Deporte', category: 'Salud', icon: Dumbbell, defaultColor: '#14B8A6' },
  { name: 'Smile', label: 'Cuidado Personal', category: 'Salud', icon: Smile, defaultColor: '#84CC16' },

  // Ocio y Entretenimiento
  { name: 'Film', label: 'Cine / Salidas', category: 'Ocio', icon: Film, defaultColor: '#8B5CF6' },
  { name: 'Gamepad2', label: 'Videojuegos', category: 'Ocio', icon: Gamepad2, defaultColor: '#6366F1' },
  { name: 'Music', label: 'Música / Conciertos', category: 'Ocio', icon: Music, defaultColor: '#D946EF' },
  { name: 'Ticket', label: 'Eventos', category: 'Ocio', icon: Ticket, defaultColor: '#F97316' },
  { name: 'PartyPopper', label: 'Fiesta / Celebración', category: 'Ocio', icon: PartyPopper, defaultColor: '#EC4899' },

  // Finanzas y Trabajo
  { name: 'CreditCard', label: 'Tarjeta de Crédito', category: 'Finanzas', icon: CreditCard, defaultColor: '#6366F1' },
  { name: 'Wallet', label: 'Billetera', category: 'Finanzas', icon: Wallet, defaultColor: '#10B981' },
  { name: 'Banknote', label: 'Efectivo', category: 'Finanzas', icon: Banknote, defaultColor: '#14B8A6' },
  { name: 'Briefcase', label: 'Trabajo', category: 'Finanzas', icon: Briefcase, defaultColor: '#3B82F6' },
  { name: 'Laptop', label: 'Tecnología / Software', category: 'Finanzas', icon: Laptop, defaultColor: '#0EA5E9' },

  // Compras y Varios
  { name: 'ShoppingBag', label: 'Compras / Ropa', category: 'Compras', icon: ShoppingBag, defaultColor: '#D946EF' },
  { name: 'Gift', label: 'Regalos', category: 'Compras', icon: Gift, defaultColor: '#F43F5E' },
  { name: 'Tag', label: 'Etiqueta General', category: 'Compras', icon: TagIconLucide, defaultColor: '#3B82F6' },
  { name: 'BookOpen', label: 'Libros', category: 'Educación', icon: BookOpen, defaultColor: '#F59E0B' },
  { name: 'GraduationCap', label: 'Educación / Cursos', category: 'Educación', icon: GraduationCap, defaultColor: '#6366F1' },
  { name: 'PawPrint', label: 'Mascotas', category: 'Varios', icon: PawPrint, defaultColor: '#84CC16' },
  { name: 'Baby', label: 'Bebé / Hijos', category: 'Varios', icon: Baby, defaultColor: '#06B6D4' },
  { name: 'HelpCircle', label: 'Otro / General', category: 'Varios', icon: HelpCircle, defaultColor: '#64748B' },
];

export const TAG_ICONS_MAP: Record<string, LucideIcon> = TAG_ICONS_LIST.reduce(
  (acc, item) => {
    acc[item.name] = item.icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);

export const getDefaultColorForIcon = (iconName?: string): string => {
  if (!iconName) return DEFAULT_TAG_COLOR;
  const found = TAG_ICONS_LIST.find((i) => i.name === iconName);
  return found?.defaultColor || DEFAULT_TAG_COLOR;
};
