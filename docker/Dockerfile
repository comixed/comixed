FROM alpine:latest
RUN apk --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing add openjdk11 unzip wget bash

MAINTAINER Pidockmedia "pidockmedia@gmail.com"

RUN mkdir /app /ul
WORKDIR /ul
RUN wget -q -O comixed-release.zip https://github.com/comixed/comixed/releases/download/v1.0.0-2/comixed-release-1.0.0-2-RELEASE.zip
RUN (cd /app; unzip /ul/*.zip)
RUN rm *.zip
WORKDIR /app
RUN rm -r /ul

ENV PATH="$JAVA_HOME/bin:${PATH}"

EXPOSE 7171
VOLUME /comic_data

CMD ["bash", "/app/comixed-release-1.0.0-2/bin/run.sh", "-L", "/library/comixed.log"]
