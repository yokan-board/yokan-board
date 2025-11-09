FROM node:18-alpine AS builder
WORKDIR /app
# ARG REACT_APP_SERVER_URL
# ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL
COPY package.json package-lock.json ./
RUN npm install --silent
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", ".", "-l", "3000"]
