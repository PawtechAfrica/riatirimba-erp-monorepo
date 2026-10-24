
# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# ENV NODE_ENV=production

# EXPOSE 7000


# CMD ["node", "app.js"]









# FROM node:22-slim

# # Install Chrome dependencies
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     ca-certificates \
#     fonts-liberation \
#     libasound2 \
#     libatk-bridge2.0-0 \
#     libatk1.0-0 \
#     libcairo2 \
#     libcups2 \
#     libdbus-1-3 \
#     libdrm2 \
#     libexpat1 \
#     libfontconfig1 \
#     libgbm1 \
#     libglib2.0-0 \
#     libgtk-3-0 \
#     libnspr4 \
#     libnss3 \
#     libpango-1.0-0 \
#     libpangocairo-1.0-0 \
#     libx11-6 \
#     libx11-xcb1 \
#     libxcb1 \
#     libxcomposite1 \
#     libxcursor1 \
#     libxdamage1 \
#     libxext6 \
#     libxfixes3 \
#     libxi6 \
#     libxkbcommon0 \
#     libxrandr2 \
#     libxrender1 \
#     libxss1 \
#     libxtst6 \
#     wget \
#     xdg-utils \
#     dumb-init \
#     && rm -rf /var/lib/apt/lists/*

# WORKDIR /app

# # Copy dependency files first for better layer caching
# COPY package*.json ./

# # Install Node dependencies
# RUN npm ci

# # Install Chrome managed by Puppeteer
# RUN npx puppeteer browsers install chrome

# # Copy application source
# COPY . .

# ENV NODE_ENV=production

# EXPOSE 7000

# # Use dumb-init to handle signals correctly
# ENTRYPOINT ["dumb-init", "--"]

# CMD ["node", "app.js"]















FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 7000

CMD ["node", "app.js"]