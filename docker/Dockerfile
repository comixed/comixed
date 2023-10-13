FROM openjdk:17-jdk-slim

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
       openjdk-11-jre \
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
RUN wget -q -O comixed-release.zip https://github.com/comixed/comixed/releases/download/v2.0.0-0.dev/comixed-release-2.0.0-0.dev-GA.zip
RUN (cd /app; unzip /ul/*.zip)
RUN rm *.zip
WORKDIR /app
RUN rm -r /ul

ENV PATH="$JAVA_HOME/bin:${PATH}"

EXPOSE 7171
VOLUME /comic_data
VOLUME /library
VOLUME /imports

CMD ["bash", "/app/comixed-release-2.0.0-0.dev/bin/run.sh", "-L", "/library/comixed.log"]
