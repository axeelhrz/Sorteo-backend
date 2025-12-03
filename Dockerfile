FROM node:20-alpine

WORKDIR /app

# Copiar package.json (y package-lock.json si existe)
COPY package*.json ./

# Instalar dependencias
# Usar npm install si no hay package-lock.json, npm ci si existe
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copiar código fuente
COPY dist ./dist

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]