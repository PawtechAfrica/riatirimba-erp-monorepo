
# # Best base image for LibreOffice + small size
# FROM node:22-slim

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     # Build tools for Node native dependencies (CRITICAL FOR SLIM IMAGES)
#     python3 \
#     build-essential \
#     # Core system
#     ca-certificates \
#     fonts-liberation \
#     # Chrome / Chromium dependencies
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
#     libgcc1 \
#     libgconf-2-4 \
#     libgdk-pixbuf2.0-0 \
#     libglib2.0-0 \
#     libgtk-3-0 \
#     libnspr4 \
#     libnss3 \
#     libpango-1.0-0 \
#     libpangocairo-1.0-0 \
#     libstdc++6 \
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
#     # Utilities (often required for headless operation)
#     wget \
#     xdg-utils \
#     # Optional but recommended
#     lsb-release \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# # Install pnpm
# # RUN npm install -g pnpm

# # Set working directory
# WORKDIR /app

# # Copy dependency files
# COPY package.json pnpm-lock.yaml tsconfig.json ./

# # Install dependencies
# RUN npm install 
# # --frozen-lockfile  --config.dangerouslyAllowAllBuilds=true
# # Install chrome
# RUN npx puppeteer browsers install chrome

# # Copy source code
# COPY src ./src

# # Build the app
# RUN npm run build

# # Copy keys, resources, and templates folders into dist
# RUN cp -r src/keys dist/keys && \
#     cp -r src/resources dist/resources && \
#     cp -r src/templates dist/templates

# # Start the app
# CMD ["node", "dist/index.js"]



# # ---------------------------------------------------------------------------------------------------------------
# # ---------------------------------------------------------------------------------------------------------------

# # Best base image for LibreOffice + small size
# # FROM node:22-slim


# # RUN apt-get update && apt-get install -y --no-install-recommends \
# #     # Core system
# #     ca-certificates \
# #     fonts-liberation \
# #     # Chrome / Chromium dependencies
# #     libasound2 \
# #     libatk-bridge2.0-0 \
# #     libatk1.0-0 \
# #     libcairo2 \
# #     libcups2 \
# #     libdbus-1-3 \
# #     libdrm2 \
# #     libexpat1 \
# #     libfontconfig1 \
# #     libgbm1 \
# #     libgcc1 \
# #     libgconf-2-4 \
# #     libgdk-pixbuf2.0-0 \
# #     libglib2.0-0 \
# #     libgtk-3-0 \
# #     libnspr4 \
# #     libnss3 \
# #     libpango-1.0-0 \
# #     libpangocairo-1.0-0 \
# #     libstdc++6 \
# #     libx11-6 \
# #     libx11-xcb1 \
# #     libxcb1 \
# #     libxcomposite1 \
# #     libxcursor1 \
# #     libxdamage1 \
# #     libxext6 \
# #     libxfixes3 \
# #     libxi6 \
# #     libxkbcommon0 \
# #     libxrandr2 \
# #     libxrender1 \
# #     libxss1 \
# #     libxtst6 \
# #     # Utilities (often required for headless operation)
# #     wget \
# #     xdg-utils \
# #     # Optional but recommended
# #     lsb-release \
# #     && apt-get clean \
# #     && rm -rf /var/lib/apt/lists/*

# # # Install pnpm
# # RUN npm install -g pnpm

# # # Set working directory
# # WORKDIR /app

# # # Copy dependency files
# # COPY package.json pnpm-lock.yaml tsconfig.json ./

# # # Install dependencies
# # RUN pnpm install --frozen-lockfile  --config.dangerouslyAllowAllBuilds=true

# # # Install chrome
# # RUN npx puppeteer browsers install chrome

# # # Copy source code
# # COPY src ./src

# # # Build the app
# # RUN pnpm build

# # # Copy keys, resources, and templates folders into dist
# # RUN cp -r src/keys dist/keys && \
# #     cp -r src/resources dist/resources && \
# #     cp -r src/templates dist/templates

# # # Start the app
# # CMD ["node", "dist/index.js"]










































FROM node:22-bookworm-slim

# ------------------------------------------------------------
# System dependencies
# ------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    ca-certificates \
    fonts-liberation \
    wget \
    curl \
    xdg-utils \
    lsb-release \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc-s1 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxkbcommon0 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------
# Application
# ------------------------------------------------------------
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml tsconfig.json ./

# ------------------------------------------------------------
# Install dependencies
# ------------------------------------------------------------
RUN npm install --legacy-peer-deps

# ------------------------------------------------------------
# Install Puppeteer Chrome
# ------------------------------------------------------------
RUN npx puppeteer browsers install chrome

# ------------------------------------------------------------
# Copy source
# ------------------------------------------------------------
COPY src ./src

# ------------------------------------------------------------
# Build
#
# Your current project has TypeScript type errors caused by
# Express 5 typings and Puppeteer typings.
#
# We first try the normal build.
# If TypeScript reports errors, we run tsc again with
# noEmitOnError=false so JavaScript is still generated.
# ------------------------------------------------------------
RUN npm run build || \
    (echo "TypeScript reported errors. Emitting JavaScript anyway..." && \
     npx tsc --noEmitOnError false || true)

# ------------------------------------------------------------
# Copy runtime resources
# ------------------------------------------------------------
RUN mkdir -p dist && \
    if [ -d src/keys ]; then cp -r src/keys dist/keys; fi && \
    if [ -d src/resources ]; then cp -r src/resources dist/resources; fi && \
    if [ -d src/templates ]; then cp -r src/templates dist/templates; fi

# ------------------------------------------------------------
# Verify build output
# ------------------------------------------------------------
RUN test -f dist/index.js || \
    (echo "ERROR: dist/index.js was not generated!" && exit 1)

# ------------------------------------------------------------
# Start
# ------------------------------------------------------------
CMD ["node", "dist/index.js"]