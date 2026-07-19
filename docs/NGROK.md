# Guía NGROK - Proteus Protection

NGROK permite exponer tu servidor local a través de una URL pública HTTPS, útil para:
- Probar webhooks
- Compartir el proyecto con otros
- Pruebas en dispositivos móviles
- Demostraciones

## Instalación

### Windows
```bash
# Descargar ngrok.exe desde https://ngrok.com/download
# O usar el ngrok.exe incluido en la raíz del proyecto
```

### Linux/macOS
```bash
# macOS
brew install ngrok

# Linux (Debian/Ubuntu)
curl -sSL https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz | tar xz
sudo mv ngrok /usr/local/bin/
```

## Configuración

1. Crear cuenta gratuita en [ngrok.com](https://ngrok.com)
2. Obtener tu authtoken desde [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Configurar:
```bash
ngrok config add-authtoken TU_TOKEN_AQUI
```

## Uso con Proteus Protection

### Opción 1: Script automático

**Windows (PowerShell):**
```powershell
.\scripts\ngrok-start.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/ngrok-start.sh
./scripts/ngrok-start.sh
```

### Opción 2: Manual paso a paso

```bash
# 1. Iniciar PostgreSQL
docker compose up -d postgres

# 2. Terminal 1: Next.js
$env:HOSTNAME = "0.0.0.0"  # PowerShell
HOSTNAME=0.0.0.0 pnpm dev  # bash

# 3. Terminal 2: NGROK
ngrok http 3000
```

### Opción 3: Docker completo + NGROK

```bash
# 1. Build y levantar DB + App
docker compose up -d

# 2. NGROK apuntando al contenedor
ngrok http localhost:3000
```

## Verificar el túnel

1. Abrir [http://localhost:4040](http://localhost:4040) (inspector de NGROK)
2. Copiar la URL pública (ej: `https://abc123.ngrok-free.app`)
3. Abrir en el navegador

## Configuración avanzada

### ngrok.yml (opcional)

Crear `ngrok.yml` en la raíz del proyecto:

```yaml
version: "2"
tunnels:
  proteus:
    addr: 3000
    proto: http
    inspect: true
    schemes:
      - https
```

Ejecutar con:
```bash
ngrok start proteus
```

### Túnel con subdominio (plan de pago)

```bash
ngrok http --domain=tu-subdominio.ngrok-free.app 3000
```

## Consideraciones

### Cookies y seguridad
- NGROK usa HTTPS, pero tu app local corre en HTTP
- Las cookies `secure: true` NO funcionarán a través de NGROK
- Solución: El proyecto ya maneja esto con `secure: process.env.NODE_ENV === 'production'`
- En desarrollo, las cookies funcionan correctamente a través de NGROK

### Base de datos
- NGROK solo tunnela el servidor web, NO la base de datos
- PostgreSQL sigue accesible en `localhost:5432`
- Para acceder desde otro contenedor, usa la red Docker interna

### Límites del plan gratuito
- 1 túnel a la vez
- URLs aleatorias en cada reinicio
- Sin subdominios personalizados
- Límite de 40 conexiones/minuto

## Solución de problemas

### "ngrok not found"
Asegúrate de que `ngrok.exe` esté en la raíz del proyecto o en el PATH del sistema.

### "Connection refused" al acceder a la URL
1. Verifica que Next.js esté corriendo: `pnpm dev`
2. Verifica que el HOSTNAME esté configurado: `$env:HOSTNAME = "0.0.0.0"`
3. Verifica el puerto: NGROK apunta a `3000` por defecto

### Cookies no persisten
- Las cookies `sameSite: 'lax'` funcionan con NGROK
- Verifica que el dominio NGROK coincida con el configurado

### CORS errors
- NGROK no debería causar CORS, pero si ocurre, agrega el dominio NGROK a `next.config.mjs`:
```js
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: 'https://tu-url.ngrok-free.app' },
    ],
  }]
}
```
