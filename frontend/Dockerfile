FROM node:lts

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

RUN npm install express

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 8000

# Run the application in development mode
CMD ["npm", "run", "dev"]