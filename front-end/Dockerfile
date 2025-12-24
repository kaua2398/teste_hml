# ============================
# STAGE 1 — Build Angular app
# ============================
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli && npm install
COPY . .
RUN npm run build -- --configuration production

# ============================
# STAGE 2 — Run with Express
# ============================
FROM node:20-slim

WORKDIR /app

# Copia o build compilado
COPY --from=build /app/dist ./dist

# Copia package.json e server.js
COPY package*.json ./
COPY server.js ./

# Instala somente dependências de produção
RUN npm install express --omit=dev

EXPOSE 4000
ENV PORT=4000
CMD ["node", "server.js"]