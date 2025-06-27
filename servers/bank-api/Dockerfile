# Verwende Node.js als Basis
FROM node:20-alpine
LABEL authors="sikoby"

# Create and set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY servers/bank-api/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY servers/bank-api .


# Heimdall-CLI ins Image kopieren
COPY heimdall ./heimdall

# Skript ausführbar machen und ausführen
RUN chmod +x ./heimdall/install-heimdall.sh && cd heimdall && ./install-heimdall.sh

# Expose port 3000 (or whatever port your app listens on)
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]