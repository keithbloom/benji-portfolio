# Stage 1: Build CSS with Tailwind
FROM node:18-alpine as node-builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy Tailwind config and source files
COPY tailwind.config.js ./
COPY assets ./assets

# Build CSS
RUN npm run tailwind:build

# Stage 2: Build the Hugo site
FROM klakegg/hugo:ext-alpine

WORKDIR /src

# Install git
RUN apk add --no-cache git

# Copy the built CSS from the first stage
COPY --from=node-builder /app/assets/css/style.css /src/assets/css/style.css

# Copy the rest of the site content
COPY . .

# Build the site
CMD ["server", "--bind", "0.0.0.0", "--themesDir", "themes", "--theme", "hugo-creative-portfolio-theme"]