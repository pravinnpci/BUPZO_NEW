# Use the official Next.js image
FROM node:18-alpine as builder

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Use the official Node.js image for production
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Install production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]