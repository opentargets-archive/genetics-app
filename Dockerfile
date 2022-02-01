
# ============================== node/build section =====================================================
FROM node:12 as build

COPY package.json yarn.lock /tmp/genetics-app/
WORKDIR /tmp/genetics-app/

RUN yarn
COPY . /tmp/genetics-app/
RUN yarn build

# ============================== node section =====================================================
FROM node:12 as build

COPY package.json yarn.lock /tmp/genetics-app/
WORKDIR /tmp/genetics-app/

RUN yarn
COPY . /tmp/genetics-app/
RUN yarn build