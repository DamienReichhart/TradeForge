FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "npm run build && serve -s build"] 