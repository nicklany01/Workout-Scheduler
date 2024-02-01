FROM node:21-alpine

WORKDIR /app
# install dependecies first to take advantage of caching
COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["npm" , "start"]