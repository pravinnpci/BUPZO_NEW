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

# Expose port 3000 (default for Node.js)
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]