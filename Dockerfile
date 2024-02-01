# first stage, build react app
FROM node:21-alpine AS build

WORKDIR /app
# install dependecies first to take advantage of caching
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# second stage, use nginx to serve the production build
FROM nginx:alpine

WORKDIR /hmnt/webapp

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

ENV NODE_ENV=production

CMD ["nginx", "-g", "daemon off;"]