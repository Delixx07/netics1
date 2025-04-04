FROM node:18

WORKDIR /usr/app

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]
