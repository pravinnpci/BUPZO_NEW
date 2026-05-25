# Use official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Expose the port the app runs on
EXPOSE 3004

# Command to run the application
CMD ["node", "index.js"]