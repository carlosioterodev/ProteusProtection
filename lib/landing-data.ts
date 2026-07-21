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
  detailedDescription: string
  features: string[]
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
    detailedDescription:
      'Proteus Shield utiliza inteligencia artificial de última generación para analizar cada archivo y proceso en tiempo real. Nuestro motor heurístico detecta amenazas conocidas y desconocidas, incluyendo variantes de ransomware zero-day. El firewall inteligente aprende de tus patrones de uso y bloquea conexiones sospechosas sin interrumpir tu productividad. Ideal para usuarios que buscan protección robusta sin complicaciones.',
    features: [
      'Escaneo de archivos en tiempo real con IA',
      'Firewall adaptativo que aprende de tu uso',
      'Protección contra ransomware y phishing',
      'Actualizaciones automáticas de base de datos de amenazas',
      'Bajo consumo de recursos del sistema',
    ],
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
    detailedDescription:
      'Proteus Vault protege todas tus credenciales con cifrado AES-256 de extremo a extremo. Genera contraseñas únicas y seguras automáticamente, las almacena de forma segura y las completa en tus navegadores y aplicaciones. Sincroniza tus contraseñas de forma segura entre todos tus dispositivos. Incluye un verificador de seguridad que analiza la fortaleza de tus contraseñas existentes y te alerta sobre vulnerabilidades.',
    features: [
      'Cifrado AES-256 de extremo a extremo',
      'Generador de contraseñas seguras',
      'Autocompletado en navegadores y apps',
      'Sincronización segura entre dispositivos',
      'Verificador de seguridad de contraseñas',
    ],
    icon: KeyRound,
    highlight: 'Cifrado AES-256',
  },
  {
    id: 'tune',
    name: 'Proteus Tune',
    tagline: 'Optimización del sistema',
    description:
      'Limpieza inteligente, gestión de procesos y ajuste de rendimiento para mantener tus equipos rápidos y ligeros.',
    detailedDescription:
      'Proteus Tune analiza tu sistema en busca de archivos temporales, caché innecesaria y procesos que consumen recursos excesivos. Nuestro algoritmo de optimización inteligente identifica cuellos de botella y ajusta la configuración del sistema para maximizar el rendimiento. Monitorea el uso de CPU, memoria y disco en tiempo real, ofreciendo recomendaciones personalizadas para mantener tu equipo funcionando como nuevo.',
    features: [
      'Limpieza inteligente de archivos temporales',
      'Gestión de procesos en segundo plano',
      'Optimización de inicio del sistema',
      'Monitoreo de rendimiento en tiempo real',
      'Programación de limpiezas automáticas',
    ],
    icon: Gauge,
    highlight: 'Hasta 3x más rápido',
  },
  {
    id: 'guard',
    name: 'Proteus Guard',
    tagline: 'Privacidad y VPN',
    description:
      'Navegación cifrada, protección de identidad y monitoreo de fugas de datos en la web para blindar tu información.',
    detailedDescription:
      'Proteus Guard combina una VPN de alta velocidad con herramientas avanzadas de protección de privacidad. Navega de forma anónima sin rastreo, accede a contenido geo-restringido y protege tu identidad digital. Monitoreamos la dark web en busca de filtraciones de tu información personal y te alertamos inmediatamente si detectamos que tus datos han sido comprometidos.',
    features: [
      'VPN con servidores en 50+ países',
      'Kill switch automático',
      'Monitoreo de fugas de datos en dark web',
      'Bloqueador de rastreadores y anuncios',
      'Protección contra phishing en tiempo real',
    ],
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
  detailedDescription: string
  features: string[]
  cta: string
  trialDays: number
  featured?: boolean
}

export const plans: Plan[] = [
  {
    name: 'Personal',
    price: '$4.99',
    period: '/mes',
    description: 'Para proteger un dispositivo personal.',
    detailedDescription:
      'El plan Personal es ideal para usuarios individuales que buscan protección esencial para su dispositivo principal. Incluye antivirus y firewall de Proteus Shield, junto con la optimización de sistema de Proteus Tune. Perfecto para quienes necesitan seguridad sin complicaciones.',
    features: [
      '1 dispositivo',
      'Proteus Shield y Tune',
      'Gestor de contraseñas básico',
      'Soporte por correo',
    ],
    cta: 'Empezar gratis',
    trialDays: 14,
  },
  {
    name: 'Familiar',
    price: '$9.99',
    period: '/mes',
    description: 'Seguridad completa para toda la familia.',
    detailedDescription:
      'El plan Familiar protege a toda tu familia con hasta 5 dispositivos. Incluye toda la suite Proteus: Shield, Vault, Tune y Guard. Disfruta de VPN ilimitada, monitoreo de identidad y soporte prioritario 24/7. La mejor relación calidad-precio para familias.',
    features: [
      'Hasta 5 dispositivos',
      'Toda la suite Proteus',
      'VPN y monitoreo de identidad',
      'Soporte prioritario 24/7',
    ],
    cta: 'Elegir plan',
    trialDays: 14,
    featured: true,
  },
  {
    name: 'Empresas',
    price: '$24.99',
    period: '/mes',
    description: 'Protección escalable para tu equipo.',
    detailedDescription:
      'El plan Empresas ofrece protección robusta y escalable para organizaciones de cualquier tamaño. Incluye panel de administración central, herramientas de cumplimiento y auditoría, y un gerente de cuenta dedicado. Protege tu empresa con soluciones empresariales de nivel superior.',
    features: [
      'Dispositivos ilimitados',
      'Panel de administración central',
      'Cumplimiento y auditoría',
      'Gerente de cuenta dedicado',
    ],
    cta: 'Contactar ventas',
    trialDays: 30,
  },
]

export const stats = [
  { value: '2.4M+', label: 'Dispositivos protegidos' },
  { value: '99.9%', label: 'Amenazas bloqueadas' },
  { value: '150+', label: 'Países' },
  { value: '4.9/5', label: 'Valoración media' },
]
