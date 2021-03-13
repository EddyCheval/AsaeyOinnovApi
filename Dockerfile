# Check out https://hub.docker.com/_/node to select a new base image
FROM openkbs/jdk-mvn-py3

# Set to a non-root built-in user `root`
USER root

# Create app directory (with user `toot`)
RUN mkdir -p /home/root/app

WORKDIR /home/root/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=root package*.json ./apache-pulsar-client.deb ./apache-pulsar-client-dev.deb ./

RUN sudo dpkg -i ./apache-pulsar-client.deb ./apache-pulsar-client-dev.deb

RUN npm install

# Bundle app source code
COPY --chown=root . .

RUN npm run build

# Bind to all network interfaces so that it can be mapped to the host OS
ENV PORT=${PORT}
ENV HOST=${HOST}
ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_USER=${DB_USER}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_DATABASE=${DB_DATABASE}
ENV DB_CONNECTOR=${DB_CONNECTOR}
ENV BUCKET_NAME=${BUCKET_NAME}
ENV SECRET_KEY_S3=${SECRET_KEY_S3}
ENV ACCESS_KEY_S3=${ACCESS_KEY_S3}
ENV ENDPOINT=${ENDPOINT}
ENV TOKEN_PULSAR=${TOKEN_PULSAR}
ENV SERVICE_PULSAR_URL=${SERVICE_PULSAR_URL}
EXPOSE ${PORT}
CMD [ "node", "." ]
