FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Add Express and cors for the server
RUN npm install -g serve

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the custom server
CMD ["sh", "-c", "npm run build && serve -s build"] 