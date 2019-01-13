# ComiXed Web Frontend

The front-end code is delivered by the Java backend when the user connects with their browser. So there's no need to run the server separately.

## Development

In order to work on the front end, you'll need the following prerequisites installed:

1. Node.js - Installation instructions can be found [here](https://nodejs.org/en/download/).
1. The Angular CLI. After installing Node.js, simple do: ```$ npm install --global @angular/cli@7.0.0```

Once you have them installed, you can then install the project dependencies:
```
$ cd web-frontend
$ npm install
```

## Running The Proxy Separately

If you're doing frontend development, you can run the Angular code in it's own separate process:

1. Start the Java backend from the **java-backend** directory: ```mvn clean spring-boot:run -DskipTests=true```
1. Start the frontend from the **web-frontend** directory: ```ng server --proxy-config proxy.conf.json```
1. Connect to the frontend with your browser: **http://localhost:4200/**

Doing this, you can change the frontend code without having to restart the whole server.
