# Proteus Protection

Plataforma de soluciones de seguridad y mantenimiento digital: protección en tiempo real, gestor de contraseñas y optimización del sistema.

## Arquitectura

```
ProteusProtection/
├── app/                    # Next.js App Router
│   ├── api/                # API REST (Auth + Passwords)
│   ├── dashboard/          # Panel principal
│   ├── login/              # Autenticación
│   └── layout.tsx          # Layout raíz
├── components/             # Componentes React
│   ├── dashboard/          # Panel de control
│   ├── landing/            # Landing page
│   └── ui/                 # Componentes reutilizables
├── lib/                    # Utilidades compartidas
│   ├── auth.ts             # JWT + bcrypt
│   ├── db.ts               # Pool PostgreSQL
│   └── utils.ts            # Helpers
├── init-db/                # Esquema SQL
├── scripts/                # Scripts de automatización
└── docker-compose.yml      # Orquestación Docker
```

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Base de datos | PostgreSQL 16 (Docker) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| UI | shadcn/ui, Lucide Icons, Anime.js |
| Despliegue | Docker, NGROK, Vercel |

## Requisitos previos

- **Node.js** >= 22
- **pnpm** >= 9
- **Docker** (opcional, para PostgreSQL)
- **NGROK** (opcional, para túnel público)

## Instalación rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/carlosioterodev/ProteusProtection.git
cd ProteusProtection

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar PostgreSQL (requiere Docker)
docker compose up -d postgres

# 5. Ejecutar el proyecto
pnpm dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Usuario de PostgreSQL | `proteus_user` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `proteus_pass_2026` |
| `POSTGRES_DB` | Nombre de la base de datos | `proteus_protection_db` |
| `DATABASE_URL` | URL completa de conexión | Ver `.env.example` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | Ver `.env.example` |

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm dev:ngrok` | Desarrollo + túnel NGROK |
| `pnpm build` | Build de producción |
| `pnpm start` | Iniciar en producción |
| `pnpm docker:up` | Levantar todos los servicios Docker |
| `pnpm docker:down` | Detener todos los servicios |
| `pnpm docker:logs` | Ver logs de Docker |
| `pnpm start:docker` | PostgreSQL + dev en paralelo |
| `pnpm lint` | Linter ESLint |

## API Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Crear cuenta |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/me` | Obtener usuario actual |

### Gestor de contraseñas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/passwords` | Listar contraseñas |
| `POST` | `/api/passwords` | Crear contraseña |
| `PUT` | `/api/passwords` | Actualizar contraseña |
| `DELETE` | `/api/passwords` | Eliminar contraseña |

## Despliegue con Docker

```bash
# Build completo (DB + App)
docker compose up -d

# Ver logs
docker compose logs -f app

# Detener
docker compose down
```

## Despliegue con NGROK

```bash
# Opción 1: Script automático
.\scripts\ngrok-start.ps1    # Windows
./scripts/ngrok-start.sh     # Linux/macOS

# Opción 2: Manual
# Terminal 1: Base de datos
docker compose up -d postgres

# Terminal 2: Next.js
$env:HOSTNAME = "0.0.0.0"
pnpm dev

# Terminal 3: Túnel
ngrok http 3000
```

Ver [docs/NGROK.md](docs/NGROK.md) para guía completa.

## Despliegue en Vercel

El proyecto está preconfigurado para Vercel con `@vercel/analytics` integrado.

1. Conectar el repositorio a Vercel
2. Configurar variables de entorno en el dashboard
3. Desplegar (auto-detecta Next.js)

## Seguridad

- Contraseñas hasheadas con bcrypt (12 rondas)
- Tokens JWT con expiración de 7 días
- Cookies `httpOnly` y `secure` en producción
- Middleware de protección de rutas
- Validación de entrada en todos los endpoints
- Las contraseñas se almacenan cifradas en PostgreSQL

## Licencia

Proyecto académico - Derechos reservados
