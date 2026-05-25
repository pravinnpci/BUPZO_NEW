# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app/bupzomcp

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port 3004 (as configured in docker-compose.yml)
EXPOSE 3004

# Start the application
CMD ["node", "index.js"]