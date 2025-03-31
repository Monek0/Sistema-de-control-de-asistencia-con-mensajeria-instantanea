FROM ubuntu:latest

# Set environment variables
ENV LAMBDA_TASK_ROOT=/var/task
ENV NODE_ENV=production

# Install basics and Node.js 22.x
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y curl wget gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Check installed versions
RUN node -v && npm -v

# Install Chrome dependencies for Puppeteer
RUN apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2t64 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
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
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    fonts-noto-color-emoji \
    fonts-dejavu \
    fonts-liberation \
    fonts-freefont-ttf

# Create working directory
RUN mkdir -p ${LAMBDA_TASK_ROOT}
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files first for better layer caching
COPY package*.json ${LAMBDA_TASK_ROOT}/

# Install Node.js dependencies
RUN npm i

# Copy the rest of the application
COPY . ${LAMBDA_TASK_ROOT}/

# Install additional dependencies
RUN npm install --save \
    @vendia/serverless-express \
    whatsapp-web.js \
    puppeteer \
    @aws-sdk/client-s3 \
    wwebjs-aws-s3

# Add the Lambda Runtime Interface Emulator
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/bin/aws-lambda-rie
RUN chmod 755 /usr/bin/aws-lambda-rie

# Create the entrypoint script
RUN echo '#!/bin/bash\n\
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then\n\
  exec /usr/bin/aws-lambda-rie node ${LAMBDA_TASK_ROOT}/src/app.lambda.js\n\
else\n\
  exec node ${LAMBDA_TASK_ROOT}/src/app.lambda.js\n\
fi' > /entrypoint.sh && \
chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"] 