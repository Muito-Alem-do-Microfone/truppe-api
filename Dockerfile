# Use Node.js LTS as base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
ENV SKIP_HUSKY=true
RUN npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Expose the API port
EXPOSE 3000

# Command to run the application
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run prisma:seed && npm start"]

