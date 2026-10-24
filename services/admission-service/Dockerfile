FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Force installation of ALL dependencies (including devDependencies like ts-node)
# and bypass the pnpm v10 interactive approval prompt
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

# Copy your raw TypeScript source code
COPY src ./src

# Build the TypeScript source code into JavaScript
RUN pnpm run build

# Run the compiled JavaScript app
CMD ["pnpm", "run", "start"]
