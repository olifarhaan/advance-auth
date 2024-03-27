# Use the official Node.js image with Alpine Linux
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY server/package*.json ./

# Install npm dependencies
RUN npm install --production

# Copy the rest of the application code
COPY ./server .

RUN npm install --only=dev

# Build TypeScript code
RUN npm run build

# Expose port (change it if your server listens on a different port)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/server.js"]
