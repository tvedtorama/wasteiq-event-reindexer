FROM node:8.3-alpine

RUN mkdir -p /code

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3000 for node
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT

# install dependencies first, in a different location for easier app bind mounting for local development
WORKDIR /code
COPY package.json package-lock.json* ./
RUN npm install --production && npm cache clean --force
ENV PATH /code/node_modules/.bin:$PATH

# copy in our source code last, as it changes the most
COPY ./index.js /code
COPY ./build /code/build

# RUN apk add --update bash && rm -rf /var/cache/apk/*

CMD [ "node", "index.js" ]
