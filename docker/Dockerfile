FROM amazoncorretto:21-alpine-jdk

RUN $JAVA_HOME/bin/jlink \
         --add-modules java.base \
         --strip-debug \
         --no-man-pages \
         --no-header-files \
         --compress=2 \
         --output /javaruntime

FROM debian:buster-slim
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH "${JAVA_HOME}/bin:${PATH}"
COPY --from=jre-build /javaruntime $JAVA_HOME

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
RUN wget -q -O comixed-release.zip https://github.com/comixed/comixed/releases/download/v3.1.0/comixed-release-3.1.0.zip
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
