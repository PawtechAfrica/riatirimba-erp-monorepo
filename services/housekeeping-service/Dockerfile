FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Install pg_dump, mysqldump, and rclone
RUN apk add --no-cache bash curl unzip postgresql-client mysql-client docker-cli \
  && curl https://rclone.org/install.sh | bash

# Ensure /app/backups exists
RUN mkdir -p /app/backups

CMD ["node", "index.js"]
