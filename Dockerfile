# Use Node.js LTS as base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the API port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
