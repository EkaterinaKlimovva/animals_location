FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Wait for database and run migrations
CMD sh -c "npm run db:push --accept-data-loss && npm run run"