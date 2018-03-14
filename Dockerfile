FROM alpine:latest

RUN \
# Use edge repos
echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories && \
echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories

RUN \
# Install Firefox
apk update && apk upgrade && \
apk add firefox xvfb bash dbus ttf-freefont fontconfig && \
rm -rf /var/cache/apk/*

RUN \
# Create firefox + xvfb runner
mv /usr/bin/firefox /usr/bin/firefox-origin && \
echo $'#!/usr/bin/env sh\n\
Xvfb :0 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset & \n\
DISPLAY=:0.0 firefox-origin $@ \n\
killall Xvfb' > /usr/bin/firefox && \
chmod +x /usr/bin/firefox

# Install slimerjs
COPY . /usr/local/slimerjs
WORKDIR /usr/local/slimerjs

CMD "test/run_tests"
