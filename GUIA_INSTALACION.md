# Guía de Instalación y Configuración

Tutorial completo para instalar, ejecutar, probar y resolver problemas del Dashboard de Operaciones de Flota en Tiempo Real.

---

## Requisitos Previos

Solo necesitas **Docker & Docker Compose**. No se requiere Node.js, npm, ni Python local.

### Verificar Instalación

```bash
# Verificar versión de Docker (necesita 20.10+)
docker --version

# Verificar versión de Docker Compose (necesita 2.0+)
docker compose version

# Ambos deben imprimir versiones sin errores
```

Si no están instalados:
- **macOS**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: `sudo apt-get install docker.io docker-compose`

---

## Paso 1: Clonar Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/<tu-org>/realtime-app.git
cd realtime-app

# Verificar estructura de directorios
ls -la
# Debe mostrar: Dockerfile, docker-compose.dev.yml, frontend/, backend/, etc.
```

---

## Paso 2: Iniciar Servicios

### Inicio Rápido (Desarrollo)

```bash
# Iniciar todos los contenedores en background
docker-compose up -d

# Verificar que los contenedores estén ejecutándose
docker-compose ps

# Salida esperada:
# NAME                   SERVICE     STATUS      PORTS
# realtime-app-backend-1 backend     Up          0.0.0.0:4000->4000/tcp
# realtime-app-frontend-1 frontend   Up          0.0.0.0:3000->3000/tcp
```

### Esperar a Que los Servicios Estén Listos

```bash
# Verificar salud del backend (esperar ~5 segundos al inicio)
sleep 5
curl http://localhost:4000/health

# Respuesta esperada:
# {"status":"ok"}

# Verificar que frontend está sirviendo
curl -I http://localhost:3000
# Debe mostrar: HTTP/1.1 200 OK
```

---

## Paso 3: Abrir Dashboard

### En Navegador

1. Abre tu navegador
2. Visita: **http://localhost:3000**
3. Deberías ver:
   - Encabezado "Fleet Operations Dashboard"
   - Indicador de estado "● Live" (verde)
   - Sección de Métricas del Sistema (CPU, Memoria, Latencia)
   - Cuadrícula de Nodos Activos con 24 nodos mostrados
   - Pestañas de filtro (Todos los Nodos, ✓ OK, ⚠ WARNING, ✕ CRITICAL)
   - Botones de ordenamiento (CPU, Memoria, Latencia)

### Verificar Que los Datos Fluyen

1. Observa la cuadrícula de nodos - los números deben cambiar cada ~250ms
2. Haz clic en una tarjeta de nodo → Debe mostrar gráfico de series temporales (barra lateral derecha)
3. Haz clic en la pestaña "CRITICAL" → Filtra mostrando solo nodos críticos
4. Haz clic en botón de ordenamiento "Memory" → Los nodos se reordenan por uso de memoria
5. Desplázate hacia abajo → El botón "Load 24 More" aparece cuando hay >24 nodos

---

## Paso 4: Ejecutar Pruebas

### Pruebas Unitarias (Backend)

```bash
# Ejecutar pruebas unitarias del backend (50+ pruebas)
docker-compose exec backend npm test

# Salida esperada:
# Test Files: 10 passed
# Tests: 50+ passed
# Coverage: 95%+
```

### Verificación de Tipos Frontend

```bash
# Ejecutar verificación de tipos TypeScript
docker-compose exec frontend npm run typecheck

# Esperado: Sin errores
```

### Pruebas Unitarias (Frontend)

```bash
# Ejecutar pruebas unitarias del frontend
docker-compose exec frontend npm run test:run

# Debe mostrar: ~19 pruebas pasando
```

### Pruebas E2E (Cypress)

```bash
# Opción A: Ejecutar en modo headless (CI/CD)
docker-compose exec frontend npm run e2e:run

# Opción B: Abrir UI de Cypress (interactivo)
cd frontend
npm install  # Instalar cypress localmente si no está
npm run e2e

# Esperado: 14 casos de prueba pasan
# - critical-filter.cy.ts (3 pruebas)
# - sorting.cy.ts (4 pruebas)
# - infinite-scroll.cy.ts (7 pruebas)
```

---

## Paso 5: Flujo de Desarrollo

### Realizar Cambios de Código

```bash
# Editar cualquier archivo en frontend/src o backend/src
# Los cambios se recogen automáticamente por:
# - Vite (frontend): HMR - hot module reload (<1 segundo)
# - tsx (backend): watch mode - auto-restart (<2 segundos)

# No es necesario reiniciar contenedores
```

### Ver Logs en Vivo

```bash
# Logs del frontend (servidor Vite dev)
docker-compose logs -f frontend

# Logs del backend (servidor Node.js)
docker-compose logs -f backend

# Ambos (terminal dividida o nueva pestaña)
docker-compose logs -f
```

### Ejecutar Pruebas Durante el Desarrollo

```bash
# Modo watch (re-ejecutar al cambiar archivo)
docker-compose exec backend npm run test:watch

# O ejecutar archivo de prueba específico
docker-compose exec backend npm test -- aggregations
```

---

## Paso 6: Acceder a Servicios

### Frontend
- **URL**: http://localhost:3000
- **Recarga automática**: Sí (cambios en vivo)
- **Puerto**: 3000

### API Backend
- **Verificación de salud**: http://localhost:4000/health
- **WebSocket**: ws://localhost:4000/ws
- **Puerto**: 4000

### Comandos Directos

```bash
# Verificación de salud del backend
curl http://localhost:4000/health

# Verificación de tipos del frontend
docker-compose exec frontend npm run typecheck

# Ejecutar pruebas del backend con cobertura
docker-compose exec backend npm test -- --coverage

# Ejecutar pruebas de Cypress con reportero
docker-compose exec frontend npm run e2e:run -- --reporter json
```

---

## Resolución de Problemas

### Problema: "Puerto 3000 ya está en uso"

```bash
# Solución 1: Buscar y matar proceso en puerto 3000
lsof -i :3000
kill -9 <PID>

# Solución 2: Usar puerto diferente
docker-compose -f docker-compose.dev.yml up -d --build \
  -e "VITE_PORT=3001"
```

### Problema: "No se puede conectar al demonio de Docker"

```bash
# Verificar que Docker está ejecutándose
docker ps

# macOS/Windows: Iniciar Docker Desktop
# Linux: Iniciar servicio Docker
sudo systemctl start docker

# Agregar usuario al grupo docker (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

### Problema: "npm ERR! code EACCES" en Docker

```bash
# Limpiar volúmenes de Docker y reconstruir
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

### Problema: "Conexión WebSocket falló"

```bash
# Verificar que backend está ejecutándose
docker-compose ps

# Verificar logs del backend
docker-compose logs backend | tail -20

# Esperado: "[telemetry] ws://0.0.0.0:4000/ws · nodes=250"

# Forzar reinicio del backend
docker-compose restart backend
```

### Problema: "Los tipos no se reconocen" en VSCode

```bash
# Reinstalar node_modules localmente (para IDE)
cd frontend
rm -rf node_modules
npm install

# El frontend seguirá ejecutándose en Docker, pero el IDE obtiene tipos
```

### Problema: Pruebas se cuelgan o agoten tiempo

```bash
# Aumentar timeout en cypress.config.ts
# El predeterminado es 10s, aumentar a 30s para máquinas lentas

# O ejecutar prueba específica
docker-compose exec frontend npm run e2e:run -- \
  --spec cypress/e2e/critical-filter.cy.ts
```

---

## Limpieza Completa

### Detener Servicios (Preservar Datos)

```bash
docker-compose stop
# Servicios detenidos pero volúmenes preservados

# Reanudar
docker-compose start
```

### Eliminar Servicios y Datos

```bash
# Detener y eliminar contenedores
docker-compose down

# También eliminar volúmenes (reinicio completo)
docker-compose down -v

# También eliminar imágenes
docker-compose down -v --rmi all
```

### Construcción Limpia

```bash
# Eliminar todo y reconstruir desde cero
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

---

## Herramientas de Desarrollo

### Acceder al Shell del Contenedor

```bash
# Shell del frontend
docker-compose exec frontend sh

# Shell del backend
docker-compose exec backend sh

# Instalar paquetes npm adicionales
docker-compose exec frontend npm install <paquete>
```

### Ver Variables de Entorno

```bash
# Frontend
docker-compose exec frontend env | grep -i react

# Backend
docker-compose exec backend env | grep -i node
```

### Monitorear Uso de Recursos

```bash
# Mientras los servicios se ejecutan en otra pestaña
docker stats

# Ver CPU, memoria, I/O de red en tiempo real
```

---

## Siguientes Pasos

1. **Explorar el Código**: Ver [ARQUITECTURA_CODIGO.md](./documents/ARQUITECTURA_CODIGO.md)
2. **Entender el Diseño**: Ver [ARQUITECTURA_SISTEMA.md](./documents/ARQUITECTURA_SISTEMA.md)
3. **Ejecutar Pruebas**: `docker-compose exec frontend npm run e2e:run`
4. **Realizar Cambios**: Editar cualquier archivo en `frontend/src` o `backend/src`
5. **Ver Logs**: `docker-compose logs -f`

---

## Referencia Rápida

| Tarea | Comando |
|-------|---------|
| Iniciar | `docker-compose up -d` |
| Detener | `docker-compose stop` |
| Logs | `docker-compose logs -f` |
| Pruebas | `docker-compose exec frontend npm run e2e:run` |
| Limpiar | `docker-compose down -v` |
| Reconstruir | `docker-compose up -d --build` |
| Salud | `curl http://localhost:4000/health` |
| Shell | `docker-compose exec frontend sh` |

---

**¿Tienes problemas?** Consulta la sección de Resolución de Problemas arriba, o ver [REQUIREMENTS_CHECKLIST.md](./REQUIREMENTS_CHECKLIST.md) para el estado completo del proyecto.
