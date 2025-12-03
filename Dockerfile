FROM node:20-alpine

WORKDIR /app

# Copiar package.json (y package-lock.json si existe)
COPY package*.json ./

# Instalar dependencias
# Usar npm install si no hay package-lock.json, npm ci si existe
# --legacy-peer-deps para resolver conflictos de versiones entre dependencias
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --legacy-peer-deps; else npm install --omit=dev --legacy-peer-deps; fi

# Copiar código fuente
COPY dist ./dist

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]