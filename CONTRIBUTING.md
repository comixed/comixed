# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change. 

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Commit Message Rules

The goal of the following rules is to make the output for the follow command line easier to read:

```git log --pretty=oneline```

as well as making it easier to generate releases, perform interactive rebasing, and any number of other project
related tasks.

Please adhere to the following rules for each commit. This will help make generating the RELEASE.md file
easier, and will help to make your contributions easier to understand.

 * Separate subject from body with a blank line
 * Limit the subject line to 50 characters
 * Capitalize the subject line
 * Do not end the subject line with a period
 * Use the imperative mood in the subject line
 * Wrap the body at 72 characters
 * Use the body to explain what and why vs. how

 Source: http://chris.beams.io/posts/git-commit/#seven-rules
 
### Do
 * Write the summary line and description of what you have done in the imperative mood, that is as if you were narrating the changes. Start the line with "Fixed", "Added", "Changed" instead of "Fixes", "Adds", "Changes".
 * Always leave the second line blank.
 * Line break the commit message (to make the commit message readable without having to scroll horizontally in gitk).

### Do Not
 * Don't end the summary line with a period - it's a title and titles don't end with a period.

### Tips
* If it seems difficult to summarize what your commit does, it may be because it includes several logical changes or bug fixes, and are better split up into several commits using git add -p.

## Commit Template

When working on code, please use the following template for your commits:

    Short (50 chars or less) summary of changes [#xxx]
    
    More detailed explanatory text, if necessary.  Wrap it to about 72
    characters or so.  In some contexts, the first line is treated as the
    subject of an email and the rest of the text as the body.  The blank
    line separating the summary from the body is critical (unless you omit
    the body entirely); tools like rebase can get confused if you run the
    two together.
    
    Further paragraphs come after blank lines.
    
      - Bullet points are okay, too
    
      - Typically a hyphen or asterisk is used for the bullet, preceded by a
        single space, with blank lines in between, but conventions vary here


where **xxx** is the issue number being addressed by the commit. Using this template, your changes are then
visible on the ticket's page. This lets everybody know what changes were made for any issue.

### How To Describe The Change

See [Keep A Changelog](https://keepachangelog.com/en/1.0.0/) for a description for how to make a good changelog entry.
Each commit's summary should start with one of the following verbs:

 * **Added** for a new feature,
 * **Changed** for changes to existing functionality,
 * **Deprecated** for soon-to-be removed features,
 * **Removed** for now removed features,
 * **Fixed** for any bug fixes, or
 * **Security** in cases of vulnerabilities.

## Coding Conventions And Formatting

### Java

The Java code for the project is formatted using the [Google Java Formatter](https://github.com/google/google-java-format) tool. Code is automatically formatted for you when you commit locally.

To manually format the code, use the following command line:

```
$ mvn git-code-format:format-code
```

### Typescript

The frontend code uses [Prettier](https://prettier.io/) for code formatting, and the build process will fail code that does not meet this standard.

Most editors and IDEs support formatting Typescript code. Please check the documentation for the one you use for how to apply the convention when coding.

#### Lint Checks

To ensure your Angular code meets project requirements, please run the lint checks in the **comixed-frontend** module:

```
$ cd comixed-frontend
$ yarn lint
```

There should be no errors reported.

### Prerequisites

The application depends on the following pieces:
 * [Java Development Kit](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html): Minimum of JDK 12.
 * [NodeJS](https://nodejs.org/en/download/): Minimum of v10.15.3.
 * [Maven](https://maven.apache.org/download.cgi): Maven v3.

### Setting Up Your Build Environment

Once you've installed the requirements, you need to setup your environment:

1. Install [yarn](https://yarnpkg.com/en/): ```npm install -g yarn```

### Running The Build

The application is composed of several modules:
 * **comixed-model**: the domain model
 * **comixed-repositories**: the repositories,
 * **comixed-adaptors**: the various adaptors for loading archives, images, etc.,
 * **comixed-services**: the business logic layer,
 * **comixed-scrapers**: the library for building comic data scrapers,
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

You can now connect to the web application from your browser using *http://localhost:4200/*. And,
as your make changes to the Angular code, this frontend will update automatically.

## Unit Tests

To help keep the code as thoroughly tested and understandable as possible, all features and bug fixes must come with some
set of unit tests to demonstrate and validate them. Contributions should never reduce the unit test coverage for the project.

Please also be sure that the contribution does not break any existing unit tests. So be sure to run the full suite of unit
tests for the entire project before submitting your pull request.

## Pull Requests

Ensure your branch builds without errors or warnings locally. Any PR that does not pass the automated build process 
will be automatically declined.
