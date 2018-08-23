# ComiXed
An application for managing digital comics.

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

## Running The Application

To start the application, launch it from the command line with:

    $ java -jar comixed-app-*.jar

### Interacting With The Application

To connect to the web application, point a browser to *http://localhost:7171/index.html*.

You can then log into the application with one of two default accounts:

1. **Administrator** username=comixedadmin@localhost password=comixedadmin
1. **Reader** username=comixedreader@localhost password=comixedreader

## Contributing

Please see the [wiki page](../../wiki/Developer-Setup) page for getting your
environment up and running.

This project uses [Git Flow](http://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
when developing code. When working on a feature or fixing a bug, please write
and test your code against the *develop* branch. Then, when it is completed,
please send a [pull request](http://help.github.com/articles/creating-a-pull-request/)
to have the code imported.

All code should come with unit tests.

If the code is in good shape, then it will be included.

If the code needs some fixes or changes, the developers will provide feedback
asking for those changes. Then please resubmit your changes.

And, if this is your first addition to the project, please add your name to
the [CONTRIBUTORS.md](./CONTRIBUTORS.md) file with your pull request.

## Credits

* example.cbz - https://www.contrapositivediary.com/?p=1197
* missing_page.png - Original found at https://commons.wikimedia.org/wiki/File:Comic_image_missing.svg
* ConfirmationPopoverModule - https://www.npmjs.com/package/angular-confirmation-popover
* ngx-pagination - https://github.com/michaelbromley/ngx-pagination
* nx-loading - https://github.com/Zak-C/ngx-loading
