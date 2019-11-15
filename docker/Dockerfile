FROM alpine:latest
RUN apk --no-cache add openjdk8

MAINTAINER Pidockmedia "pidockmedia@gmail.com"

RUN mkdir /app
WORKDIR /app
RUN wget -q https://github.com/mcpierce/comixed/releases/download/0.4.0-20190728180804/comixed-app-0.4.0-20190728180718.jar

ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

EXPOSE 7171
VOLUME /comic_data

CMD ["java", "-jar", "/app/comixed-app.jar"]
