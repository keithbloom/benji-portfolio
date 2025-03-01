# Dockerfile
FROM klakegg/hugo:ext-alpine

WORKDIR /src

# Install git to fetch the theme
RUN apk add --no-cache git