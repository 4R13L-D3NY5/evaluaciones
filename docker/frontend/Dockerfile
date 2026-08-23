FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install -g @quasar/cli
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npx", "quasar", "dev", "-p", "8080"]
