FROM node:20-slim

ENV LANG C.utf8
ENV TZ Europe/Stockholm
ENV NODE_ENV production

WORKDIR /backend

COPY package*.json ./

RUN npm install

# The .dockerignore file prevents copying of node_modules/, db/ and others
COPY . ./

EXPOSE 1337

ENTRYPOINT ["node", "server.js"]

# Using npm to start the server will cause it not to receive stop signals
#ENTRYPOINT ["npm", "start"]

