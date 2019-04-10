# ComiXed
An application for managing digital comics.

## Status
 * TravisCI Build Status: [![Build Status](https://travis-ci.org/mcpierce/comixed.svg?branch=develop)](https://travis-ci.org/mcpierce/comixed)
 * You can download the latest **unsupported** release from the **Releases** tab. Every merge to the **Develop** branch triggers a new build.

## Overview And Goals
ComiXed is designed to be a cross-platform digital comics manager. It will:

 * import your existing and new digital comics
 * organize your comics under a single directory
 * allow you to view and edit the details of the comic	
 * search your comic library by comic details
 * identify, and delete, duplicate pages across comics
 * provide access to your library from a variety of applications

Paired with an application that can read your comics (such as
[Chunky Reader](http://chunkyreader.com/)) you will have a very powerful
and useful solution for managing and reading your digital comic collection.

## Supported Comic Formats

The following digital comic formats are supported:

 * CBZ (ZIP)
 * CBR (RAR)
 * CB7 (7ZIP)

## Building The Application

The foloowing sections will describe how to setup your location environment and
also how to build the project.

### Prerequisites

The application depends on the following pieces:
 * [Java Development Kit](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html): Minimum of JDK 8.
 * [NodeJS](https://nodejs.org/en/download/): Minimum of v10.15.3.
 * [Maven](https://maven.apache.org/download.cgi): Maven v3.

### Setting Up Your Build Environment

Once you've installed the requirements, you need to setup your environment:

1. Install [yarn](https://yarnpkg.com/en/): ```npm install -g yarn```

### Running The Build

The application is composed of several modules:
 * **comixed-library**: the domain model, persistence layer and archive adaptors,
 * **comixed-tasks**: the set of worker tasks that run in the backend server
 * **comixed-rest-api**: the web layer and REST API processors,
 * **comixed-frontend**: the Angular frontend, and
 * **comixed-app**: the application, which pulls the previous pieces together in a working application.

To build all of them then execute the following from the project's root directory:

```mvn clean package```

If the build is successful, then you will have a file in the **comixed-app/target** directory named something like **comixed-app-\*.jar**.
This is the final application artifact and what you will now be able to run.

If, however, you saw any errors, you'll need to go back and verify that you've properly setup your
environment.

## Running The Application

To start the application from the project root, launch it from the command line with:

```$ java -jar comixed-app/target/comixed-app-*.jar```

**NOTE:** As this is still an actively developed project, there's always a
chance that your local database has become corrupted. If you experience problems
with starting the application, a good first step would be to delete your local
database and try running the application again.

The database can be found:

Operating System|Location
---|---
**Windows** | C:\users\[your username]\.comixed
**Linux** | /home/[your username]/.comixed
**MacOS** | /users/[your username].comixed

### Interacting With The Application

To connect to the web application, point a browser to *http://localhost:7171/*.

You can then log into the application with one of two default accounts:

1. **Administrator** username=comixedadmin@localhost password=comixedadmin
1. **Reader** username=comixedreader@localhost password=comixedreader

### Developing The Front End

If you are working on changes to the frontend, you can launch an instance of the Angular server
separately from the backend.
 
You can launch the backend by moving to the **comixed-app** module and launching it using the
commandline:

```
mvn spring-boot:run -DskipTests
```
Then, in the **comixed-frontend** subdirectory, launch it using the commandline:

```
$ yarn start
```

You can nowconnect to the web application from your browser using *http://localhost:4200/*. And,
as your make changes to the Angular code, this frontend will update automatically.

## Reading Comics Remotely

You can read comics from your library using any comic reader that supports the [OPDS](https://opds.io/),
such as [Chunky Reader](http://chunkyreader.com/).

To allow your reader to access the library, you will need either the hostname or IP address for the computer
running ComiXed. So, for example, if that computers IP address is **192.168.1.29** then you would tell the
reader:

    Hostname: http://192.168.1.29:7171/opds
    Username: [the username for your login]
    Password: [the password for your login]

Please note that some readers (such as Chunky) assume the **/opds** portion of the URL. SO if your reader
does not see a reading list, try removing **/opds** from the URL.

Then your reader should see, at least, a reading list named **All Comics**. This list will allow you to read
all comics in your library.

Future work will allow for different reading lists to be presented via OPDS. Please stay tuned for those
changes to arrive.

## Contributing

When working on a feature or fixing a bug, please write and test your code against the *develop*
branch. Then, when it is completed, please send a [pull request](http://help.github.com/articles/creating-a-pull-request/)
to have the code imported.

All code should come with unit tests.

If the code is in good shape, then it will be included.

If the code needs some fixes or changes, the developers will provide feedback
asking for those changes. Please apply them and resubmit your changes.

And, if this is your first addition to the project, please add your name to
the [CONTRIBUTORS.md](./CONTRIBUTORS.md) file with your pull request.

## Credits

* example.cbz - https://www.contrapositivediary.com/?p=1197
* missing_page.png - Original found at https://commons.wikimedia.org/wiki/File:Comic_image_missing.svg
* ConfirmationPopoverModule - https://www.npmjs.com/package/angular-confirmation-popover
* ngx-pagination - https://github.com/michaelbromley/ngx-pagination
* nx-loading - https://github.com/Zak-C/ngx-loading
* JWT authencation code based on https://www.devglan.com/spring-security/angular-jwt-authentication
