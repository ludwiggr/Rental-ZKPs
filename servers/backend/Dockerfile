# Use official Node.js LTS version as base image
FROM node:18
LABEL authors="sikoby"

# Create and set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose port 3000 (or whatever port your app listens on)
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]

