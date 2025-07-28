# Use the official Node.js 18 image for building the application
FROM node:18 AS builder

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the Docker image
COPY package*.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install all dependencies
RUN npm ci

# Copy the rest of your frontend application to the Docker image
COPY ./src ./src
COPY ./public ./public
COPY ./.env ./.env
COPY ./env.sh ./env.sh

RUN chmod +x /app/env.sh

# Build your application
RUN npm run build

# Start a new, final image to reduce size
FROM node:18-alpine

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install serve to run the application
RUN apk add --no-cache \
    chromium \
    bash \
    && rm -rf /var/cache/apk/* /tmp/* \
    && npm install -g serve

# Set the working directory in the Docker container
WORKDIR /app

# Copy the built application and the `.env` file from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/.env /app/build/.env
COPY --from=builder /app/env.sh /app/build/env.sh

RUN chmod +x /app/build/env.sh

# Expose the port serve uses
EXPOSE 3000

# Command to serve your app
CMD [ "bash", "-c", "cd /app/build && ./env.sh && serve -s . -l 3000" ]
