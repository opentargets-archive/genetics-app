FROM node:12 as build
COPY package.json yarn.lock /tmp/genetics-app/
WORKDIR /tmp/genetics-app/
RUN yarn
COPY . /tmp/genetics-app/
RUN yarn build

FROM node:12
RUN npm install -g serve
COPY --from=build /tmp/genetics-app/build/ /var/www/genetics-app/
WORKDIR /var/www/genetics-app/
EXPOSE 80
CMD ["serve", "--no-clipboard", "--single", "-l", "tcp://0.0.0.0:80"]
