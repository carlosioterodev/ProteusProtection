import {
  ShieldCheck,
  KeyRound,
  Gauge,
  Lock,
  Radar,
  RefreshCw,
  Cloud,
  Fingerprint,
  type LucideIcon,
} from 'lucide-react'

export interface Product {
  id: string
  name: string
  tagline: string
  description: string
  icon: LucideIcon
  highlight: string
  tag?: string
}

export const products: Product[] = [
  {
    id: 'shield',
    name: 'Proteus Shield',
    tagline: 'Protección en tiempo real',
    description:
      'Antivirus y firewall inteligente que bloquea amenazas, ransomware y phishing antes de que lleguen a tus dispositivos.',
    icon: ShieldCheck,
    highlight: 'Bloqueo proactivo 24/7',
    tag: 'Más popular',
  },
  {
    id: 'vault',
    name: 'Proteus Vault',
    tagline: 'Gestor de contraseñas',
    description:
      'Bóveda cifrada de extremo a extremo para guardar, generar y autocompletar contraseñas seguras en todos tus equipos.',
    icon: KeyRound,
    highlight: 'Cifrado AES-256',
  },
  {
    id: 'tune',
    name: 'Proteus Tune',
    tagline: 'Optimización del sistema',
    description:
      'Limpieza inteligente, gestión de procesos y ajuste de rendimiento para mantener tus equipos rápidos y ligeros.',
    icon: Gauge,
    highlight: 'Hasta 3x más rápido',
  },
  {
    id: 'guard',
    name: 'Proteus Guard',
    tagline: 'Privacidad y VPN',
    description:
      'Navegación cifrada, protección de identidad y monitoreo de fugas de datos en la web para blindar tu información.',
    icon: Fingerprint,
    highlight: 'Anonimato total',
  },
]

export interface Feature {
  title: string
  description: string
  icon: LucideIcon
}

export const features: Feature[] = [
  {
    title: 'Detección con IA',
    description:
      'Motor de análisis heurístico que identifica amenazas nuevas y de día cero en milisegundos.',
    icon: Radar,
  },
  {
    title: 'Cifrado de extremo a extremo',
    description:
      'Tus datos se cifran localmente. Ni siquiera nosotros podemos verlos.',
    icon: Lock,
  },
  {
    title: 'Actualizaciones automáticas',
    description:
      'Definiciones de seguridad y mejoras que se instalan solas, sin interrumpir tu trabajo.',
    icon: RefreshCw,
  },
  {
    title: 'Respaldo en la nube',
    description:
      'Copias de seguridad cifradas y sincronización entre todos tus dispositivos.',
    icon: Cloud,
  },
]

export interface Plan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  featured?: boolean
}

export const plans: Plan[] = [
  {
    name: 'Personal',
    price: '$4.99',
    period: '/mes',
    description: 'Para proteger un dispositivo personal.',
    features: [
      '1 dispositivo',
      'Proteus Shield y Tune',
      'Gestor de contraseñas básico',
      'Soporte por correo',
    ],
    cta: 'Empezar gratis',
  },
  {
    name: 'Familiar',
    price: '$9.99',
    period: '/mes',
    description: 'Seguridad completa para toda la familia.',
    features: [
      'Hasta 5 dispositivos',
      'Toda la suite Proteus',
      'VPN y monitoreo de identidad',
      'Soporte prioritario 24/7',
    ],
    cta: 'Elegir plan',
    featured: true,
  },
  {
    name: 'Empresas',
    price: '$24.99',
    period: '/mes',
    description: 'Protección escalable para tu equipo.',
    features: [
      'Dispositivos ilimitados',
      'Panel de administración central',
      'Cumplimiento y auditoría',
      'Gerente de cuenta dedicado',
    ],
    cta: 'Contactar ventas',
  },
]

export const stats = [
  { value: '2.4M+', label: 'Dispositivos protegidos' },
  { value: '99.9%', label: 'Amenazas bloqueadas' },
  { value: '150+', label: 'Países' },
  { value: '4.9/5', label: 'Valoración media' },
]
