FROM node:20-alpine

WORKDIR /app

# Copiar package.json (y package-lock.json si existe)
COPY package*.json ./

# Instalar dependencias de producción
# Nota: --omit=dev instala solo dependencias de producción, pero incluye todas las dependencias transitivas necesarias
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --legacy-peer-deps; else npm install --omit=dev --legacy-peer-deps; fi

# Verificar que rxjs esté instalado (dependencia crítica de NestJS)
RUN npm list rxjs || npm install rxjs@^7.8.1 --legacy-peer-deps

# Copiar código fuente
COPY dist ./dist

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]