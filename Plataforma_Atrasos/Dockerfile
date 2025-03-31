FROM public.ecr.aws/lambda/nodejs:18

# Install Chrome dependencies for Puppeteer
RUN yum install -y \
    alsa-lib \
    atk \
    cups-libs \
    gtk3 \
    ipa-gothic-fonts \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXrandr \
    libXScrnSaver \
    libXtst \
    pango \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic \
    xorg-x11-fonts-misc \
    xorg-x11-fonts-Type1 \
    xorg-x11-utils \
    && yum clean all

# Copy package files
COPY package.json package-lock.json ${LAMBDA_TASK_ROOT}/
WORKDIR ${LAMBDA_TASK_ROOT}

# Install Node.js dependencies
RUN npm ci --omit=dev --omit=optional
RUN npm install --save \
    @vendia/serverless-express \
    whatsapp-web.js \
    puppeteer-core \
    chrome-aws-lambda

# Clean unnecessary files to reduce image size
RUN find node_modules -type d -name "test" -o -name "tests" | grep -v "@serverless" | xargs rm -rf || true
RUN find node_modules -name "*.md" -o -name "*.d.ts" -o -name "*.map" -o -name "LICENSE" | xargs rm -rf || true

# Copy application code
COPY src/ ${LAMBDA_TASK_ROOT}/src/
COPY .env ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler
CMD [ "src/app.handler" ] 