FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM nytimes/blender:2.92-gpu-ubuntu18.04

ENV PORT 3000
ENV HOST 0.0.0.0

WORKDIR /app
RUN apt-get update\
    && apt-get install -y nodejs xvfb zip curl
COPY --from=0 /app/ .
COPY . .
CMD ["node", "main.js"]