# ComiXed Web Frontend

The front-end code is delivered by the Java backend when the user connects with their browser. So there's no need to run the server separately.

## Running The Proxy Separately

If you're doing frontend development, you can run the Angular code in it's own separate process:

1. Start the Java backend from the **java-backend** directory: ```mvn clean spring-boot:run -DskipTests=true```
1. Start the frontend from the **web-frontend** directory: ```ng server --proxy-config proxy.conf.json```
1. Connect to the frontend with your browser: **http://localhost:4200/**

Doing this, you can change the frontend code without having to restart the whole server.
