FROM public.ecr.aws/lambda/nodejs:22

RUN apt update && apt upgrade -y

# Install Chrome dependencies for Puppeteer
RUN apt install -y \
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
    xorg-x11-utils

# Copy package files and entire application 
COPY . ${LAMBDA_TASK_ROOT}/
WORKDIR ${LAMBDA_TASK_ROOT}

# Install Node.js dependencies
RUN npm ci
RUN npm install --save \
    @vendia/serverless-express \
    whatsapp-web.js \
    puppeteer-core \
    chrome-aws-lambda \
    @aws-sdk/client-s3 \
    wwebjs-aws-s3

# Set the CMD to your handler
CMD [ "src/app.handler" ] 