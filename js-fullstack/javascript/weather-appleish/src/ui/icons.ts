/**
 * Lucide icon SVG strings for inline use.
 * Using lucide-static for tree-shakeable SVG strings.
 */
import {
  Calendar,
  ChevronLeft,
  Cloud,
  CloudDrizzle,
  Droplets,
  Eye,
  Gauge,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  Sunrise,
  Thermometer,
  Wind,
  X,
} from "lucide-static";

export const icons = {
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  wind: Wind,
  droplets: Droplets,
  eye: Eye,
  gauge: Gauge,
  sunrise: Sunrise,
  cloudDrizzle: CloudDrizzle,
  thermometer: Thermometer,
  menu: Menu,
  chevronLeft: ChevronLeft,
  plus: Plus,
  x: X,
  search: Search,
  calendar: Calendar,
} as const;
