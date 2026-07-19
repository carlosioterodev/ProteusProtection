# Guía de Despliegue - Proteus Protection

## Opciones de despliegue

| Plataforma | Complejidad | Costo | Recomendado para |
|-----------|-------------|-------|------------------|
| Vercel | Baja | Gratis | Producción, rápido |
| Docker (VPS) | Media | Variable | Control total |
| Railway | Baja | Gratis/Pago | Prototipos |
| Render | Baja | Gratis/Pago | Apps pequeñas |

## 1. Vercel (Recomendado)

El proyecto ya incluye `@vercel/analytics`.

### Pasos
1. Push a GitHub
2. Conectar repositorio en [vercel.com](https://vercel.com)
3. Configurar variables de entorno:
   - `DATABASE_URL` (usar Neon, Supabase o Aiven para PostgreSQL managed)
   - `JWT_SECRET`
4. Deploy automático

### PostgreSQL managed (gratis)
- [Neon](https://neon.tech) - 512MB gratis
- [Supabase](https://supabase.com) - 500MB gratis
- [Aiven](https://aiven.io) -_plan gratuito disponible

## 2. Docker + VPS

### Requisitos
- VPS con Docker (DigitalOcean, Linode, etc.)
- Dominio (opcional)
- NGROK o Caddy para HTTPS

### Pasos
```bash
# 1. Clonar en el VPS
git clone https://github.com/carlosioterodev/ProteusProtection.git
cd ProteusProtection

# 2. Configurar .env
cp .env.example .env
nano .env  # Editar credenciales

# 3. Levantar todo
docker compose up -d

# 4. Verificar
docker compose ps
docker compose logs app
```

### HTTPS con Caddy (auto-TLS)
Agregar al `docker-compose.yml`:
```yaml
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - app

volumes:
  caddy_data:
```

Caddyfile:
```
tudominio.com {
    reverse_proxy app:3000
}
```

## 3. Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar
railway init

# Configurar variables
railway variables set DATABASE_URL="..."
railway variables set JWT_SECRET="..."

# Desplegar
railway up
```

## 4. Render

1. Conectar GitHub en [render.com](https://render.com)
2. Crear "Web Service"
3. Build command: `pnpm install && pnpm build`
4. Start command: `pnpm start`
5. Configurar variables de entorno

## Variables de entorno por plataforma

### Vercel
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=tu-secreto-aqui
```

### Docker
Usar el archivo `.env` del proyecto.

## Base de datos

### Opción 1: Docker (local)
```bash
docker compose up -d postgres
```

### Opción 2: Neon (gratis, para Vercel)
1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear proyecto
3. Copiar connection string
4. Usar como `DATABASE_URL`

### Opción 3: Supabase (gratis)
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a Settings > Database
3. Copiar connection string (Transaction mode)
4. Usar como `DATABASE_URL`

## Monitoreo

- Vercel: Analytics integrado (`@vercel/analytics`)
- Docker: `docker compose logs -f app`
- NGROK: Inspector en `localhost:4040`
