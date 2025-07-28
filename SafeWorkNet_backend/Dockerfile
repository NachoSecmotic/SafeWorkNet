# Use the official Node.js 18 image as a base for the build stage
FROM node:20 AS builder

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the Docker image
COPY package*.json ./
COPY package.json ./
# Install production dependencies only
RUN npm install

# Copy the rest of your backend application to the Docker image
COPY . .

# Build your application
RUN npm run build

# Start a new, final image to reduce size, using a alpine version of Node.js
FROM node:20-alpine

# Set the working directory in the Docker container
WORKDIR /app

# Copy production dependencies and essential files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/dist ./dist
COPY package.json ./
# Optionally copy other required files like environment configs, etc.
# COPY --from=builder /app/config ./config

# Expose the port your app runs on
EXPOSE 3001

# Command to run your app
CMD ["npm", "run", "start:prod"]
