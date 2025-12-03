FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY dist ./dist

# Exponer puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]