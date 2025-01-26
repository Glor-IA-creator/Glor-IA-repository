# Usa una imagen base de Node.js
FROM node:14

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero para optimizar la caché
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto del código fuente al contenedor
COPY . .

# Expone el puerto en el que corre la aplicación frontend
EXPOSE 3000

# Comando por defecto para iniciar la aplicación
CMD ["npm", "start"]
