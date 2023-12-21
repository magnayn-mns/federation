FROM node:14

RUN mkdir /app
WORKDIR /app

COPY ./index.js ./
COPY ./package*.json ./

RUN npm install

EXPOSE 4000

ENTRYPOINT ["node", "index.js"]
