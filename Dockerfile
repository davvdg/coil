FROM node
ADD ./app.js /coil/
ADD ./package.json /coil/
ADD ./public /coil/public
ADD ./routes /coil/routes
ADD ./views  /coil/views
RUN cd /coil && npm install
WORKDIR /coil
ENTRYPOINT ["npm", "start"]
