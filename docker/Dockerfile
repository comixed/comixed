
FROM eclipse-temurin:25-jre

ARG VERSION
ENV COMIXED_VERSION=${VERSION}

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      unzip \
      bash \
      locales \
      locales-all && \
    rm -rf /var/lib/apt/lists/* && \
    locale-gen "en_US.UTF-8"

ENV LC_ALL=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8

LABEL maintainer="The ComiXed Project comixed-dev@freelists.org"
LABEL org.opencontainers.image.version="${VERSION}"

RUN mkdir /app /ul
COPY comixed-release/target/*.zip /ul/comixed-release.zip

WORKDIR /ul
RUN (cd /app && unzip /ul/comixed-release.zip) && \
    rm -rf /ul

WORKDIR /app
RUN chmod +x /app/comixed-release/bin/run.sh /app/comixed-release/bin/docker-run.sh

ENV PATH="${JAVA_HOME}/bin:${PATH}"

EXPOSE 7171
VOLUME /library
VOLUME /imports
VOLUME /config

ENTRYPOINT ["bash", "/app/comixed-release/bin/docker-run.sh", "-L", "/library/comixed.log", "-c", "/config"]
