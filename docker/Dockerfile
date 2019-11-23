FROM alpine:latest
RUN apk --no-cache add openjdk8 unzip wget

MAINTAINER Pidockmedia "pidockmedia@gmail.com"

RUN mkdir /app /dl
WORKDIR /dl
RUN wget -qO- https://api.github.com/repos/comixed/comixed/releases/latest | grep browser_download_url | cut -d '"' -f 4 | wget -qi -
RUN unzip *.zip
RUN rm *.zip
RUN mv comixed*/bin/comixed-app*.jar /app/comixed-app.jar
RUN rm -r comixed*

ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

EXPOSE 7171
VOLUME /comic_data

CMD ["java", "-jar", "/app/comixed-app.jar"]
