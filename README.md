# ComixEd
An application for managing digital comics.

## Overview And Goals
ComixEd is designed to be a digital comics manager. It will:

 * import your existing and new digital comics
 * organize your comics under a single directory
 * allow you to view and edit the details of the comic	
 * search your comic library by comic details
 * identify, and delete, duplicate pages across comics
 * provide access to your library from a variety of applications

Paired with an application that can read your comics (such as
[Chunky Reader](http://chunkyreader.com/)) you will have a very powerful
and useful solution for reading your comic collection.

## Supported Comic Formats

The following digital comic formats are supported:

 * CBZ (ZIP)
 * CBR (RAR)
 * CB7 (7ZIP)

## Running The Application

The project is broken up into two parts:
1. the Java backend, and
1. the Angular web frontend.

### The Java Backend

The backend needs to have a few lines of configuration setup.

#### application.properties

The two main entries that need to be setup are:

    configuration.filename=C:/Users/comics/comixedrc
    spring.datasource.url=jdbc:h2:file:C:/Users/comics/comixed;create=true

The *configurtion.filename* entry tells the application where to find the persisted configuration for the application.

The *spring.datasource.url* entry tells the application where the database is location, and the *create=true* portion tells it to create the database file if it's not found.

#### Running the backend

To start the backend, launch it from the command line with:

    $ mvn spring-boot:run

### The Web Frontend

You will need to have [Angular](https://angular.io/) available on your system. You can find instructions for installing Angular [here](https://angular.io/guide/setup). This portion is a little more involved on Windows systems, but not impossible.

To start the frontend, launch it from the command line with:

    $ ng s

### Interacting With The Application

To connect to the web application, point a browser to *http://localhost:4200/library/comics*.

## Contributing

Please see the [wiki page](../../wiki/Developer-Setup) page for getting your
environment up and running.

This project uses [Git Flow](http://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
when developing code. When working on a feature or fixing a bug, please write
and test your code against the *develop* branch. Then, when it is completed,
please send a [pull request](http://help.github.com/articles/creating-a-pull-request/)
to have the code imported.

If the code is in good shape, then it will be included.

If the code needs some fixes or changes, the developers will provide feedback
asking for those changes. Then please resubmit your changes.

And, if this is your first addition to the project, please add your name to
the [CONTRIBUTORS.md](./CONTRIBUTORS.md) file with your pull request.

## Credits

example.cbz - https://www.contrapositivediary.com/?p=1197
missing_page.png - Original found at https://commons.wikimedia.org/wiki/File:Comic_image_missing.svg
ConfirmationPopoverModule - https://www.npmjs.com/package/angular-confirmation-popover
ngx-pagination - https://github.com/michaelbromley/ngx-pagination
