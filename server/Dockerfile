FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN apk add --no-cache python3 g++ make && npm install
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
