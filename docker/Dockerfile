FROM openjdk:21-jdk-slim

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
       unzip \
       wget \
       bash \
       locales \
       locales-all
RUN rm -rf /var/lib/apt/lists/*
RUN locale-gen "en_US.UTF-8"

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

MAINTAINER The ComiXed Project "comixed-dev@freelists.org"

RUN mkdir /app /ul
WORKDIR /ul
RUN wget -q -O comixed-release.zip https://github.com/comixed/comixed/releases/download/v3.0-SNAPSHOT/comixed-release-3.0-SNAPSHOT.zip
RUN (cd /app; unzip /ul/*.zip)
RUN rm *.zip
WORKDIR /app
RUN rm -r /ul

ENV PATH="$JAVA_HOME/bin:${PATH}"

EXPOSE 7171
VOLUME /library
VOLUME /imports
VOLUME /config

CMD ["bash", "/app/comixed-release/bin/docker-run.sh", "-L", "/library/comixed.log", "-c", "/config"]
