FROM alpine:latest
RUN apk --no-cache add openjdk8 unzip wget

MAINTAINER Pidockmedia "pidockmedia@gmail.com"

RUN mkdir /app /ul
WORKDIR /ul
RUN wget -q -O comixed-app.zip https://github.com/comixed/comixed/releases/download/0.5.0-1/comixed-app-0.5.0-1.zip
RUN unzip *.zip
RUN rm *.zip
RUN mv comixed*/bin/comixed-app*.jar /app/comixed-app.jar
WORKDIR /app
RUN rm -r /ul

ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV PATH="$JAVA_HOME/bin:${PATH}"

EXPOSE 7171
VOLUME /comic_data

CMD ["java", "-jar", "/app/comixed-app.jar"]
