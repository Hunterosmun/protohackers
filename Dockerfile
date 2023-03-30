FROM node:19-alpine

# Create app directory
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app

# Bundle app source
COPY --chown=node:node package.json index.js ./

# Exports
EXPOSE 3000
CMD [ "node", "index.js" ]
