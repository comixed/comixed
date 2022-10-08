FROM debian:buster-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
       openjdk-11-jre unzip wget bash

MAINTAINER The ComiXed Project "comixed-dev@freelists.org"

RUN mkdir /app /ul
WORKDIR /ul
RUN wget -q -O comixed-release.zip https://github.com/comixed/comixed/releases/download/v1.3-SNAPSHOT/comixed-release-1.3-SNAPSHOT-GA.zip
RUN (cd /app; unzip /ul/*.zip)
RUN rm *.zip
WORKDIR /app
RUN rm -r /ul

ENV PATH="$JAVA_HOME/bin:${PATH}"

EXPOSE 7171
VOLUME /comic_data

CMD ["bash", "/app/comixed-release-1.3-SNAPSHOT/bin/run.sh", "-L", "/library/comixed.log"]
