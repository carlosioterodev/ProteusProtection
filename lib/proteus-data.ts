export interface PasswordEntry {
  id: string
  service: string
  username: string
  password: string
  category: 'Trabajo' | 'Personal' | 'Finanzas' | 'Social'
  strength: 'fuerte' | 'media' | 'debil'
  updatedAt: string
}

export const initialPasswords: PasswordEntry[] = [
  {
    id: 'pw-1',
    service: 'Vercel',
    username: 'admin@proteus.io',
    password: 'Xk9#mP2$vL8qR',
    category: 'Trabajo',
    strength: 'fuerte',
    updatedAt: '2026-07-10',
  },
  {
    id: 'pw-2',
    service: 'GitHub',
    username: 'proteus-dev',
    password: 'Gh7!nB4wZ',
    category: 'Trabajo',
    strength: 'fuerte',
    updatedAt: '2026-06-28',
  },
  {
    id: 'pw-3',
    service: 'Banco Digital',
    username: 'cuenta.principal',
    password: 'aB12cd34',
    category: 'Finanzas',
    strength: 'media',
    updatedAt: '2026-05-15',
  },
  {
    id: 'pw-4',
    service: 'Correo Personal',
    username: 'yo@correo.com',
    password: 'verano2024',
    category: 'Personal',
    strength: 'debil',
    updatedAt: '2026-04-02',
  },
  {
    id: 'pw-5',
    service: 'Red Social',
    username: '@proteus_user',
    password: 'Qw8*rT5!yU2pL',
    category: 'Social',
    strength: 'fuerte',
    updatedAt: '2026-07-01',
  },
  {
    id: 'pw-6',
    service: 'Servicio Cloud',
    username: 'ops@proteus.io',
    password: 'Zc3$hK9mN',
    category: 'Trabajo',
    strength: 'media',
    updatedAt: '2026-06-11',
  },
]
