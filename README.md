# ComiXed
An application for managing digital comics.

## Project Roadmap And Vision Statement
The goals for this project are simple. It seeks to be the ultimate management tool for digital comic books.

To achieve this goal, the project will:
 * be portable:
    * it can be hosted on the Mac, Linux or Windows, and
    * it can be used by any web browser.
 * manage a library of digital comic books, including:
   * the archive format of the individual files (CBR, CBZ, CB7),
   * converting files from one format to another between the supported types,
   * adding and removing images that make up the pages of the comic,
   * managing what type a page is (front cover, alternate cover, story, back cover, advertisement, etc.)
   * blacklisting pages based on hash identifiers so that they are ignored, and
   * deleting blacklisted.
   * consolidating the library, including performing any or all of the following steps:
      * moving all files into a well-defined directory structure,
      * converting comics to a single archive type,
      * removing files from each comic that has been blacklisted, and
      * updating the ComicInfo.xml file within each comic with the current metadata.
* administrators can quickly import new comics into their library.
* scraping metadata for comics from various sources, such as [ComicVine](https://comicvine.gamespot.com/).
* allow managed access to the contents of the library:
   * administrative users can create/delete other users,
   * users can create reading lists,
   * users can manage their read state for all comics in the library, and
   * users can read comics using an OPDS application.
* a plugin system allows administrators to customize the features in their application:
   * plugins can be written by third-parties to provide new and custom functionality, and
   * administrators can easily install plugins.

## What The Project Will Not Do
 * It is not a comic reading application.
    * For that, we recommend applications like [Chunky](http://chunkyreader.com/) (iOS), [YACReader](https://www.yacreader.com/) (iOS), [Kuboo](https://play.google.com/store/apps/details?id=com.sethchhim.kuboo) (Android), [Challenger Viewer](https://play.google.com/store/apps/details?id=org.kill.geek.bdviewer) (Android)

## Status
 * Project Build Status: [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fcomixed%2Fcomixed%2Fbadge%3Fref%3Ddevelop&style=flat-square)](https://actions-badge.atrox.dev/comixed/comixed/goto?ref=develop)
 * SonarCloud Status: [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=comixed_comixed&metric=alert_status)](https://sonarcloud.io/dashboard?id=comixed_comixed)
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

For details on building things locally, please see the [CONTRIBUTING.md](CONTRIBUTING.md) files.

## Participating

There are two mailing lists available for getting involved in the community.

### Users

For users of the project. please sign up for our [user list](https://www.freelists.org/list/comixed). It's where
general questions, comments and discussions around the application take place.

You can also go [here](https://www.freelists.org/archive/comixed) to search the archives.

### Developers

For contributors to the project, please sign up for our [developer list](https://www.freelists.org/list/comixed-dev).
It's where feature, coding and bug fix discussions take place.

You can also go [here](https://www.freelists.org/archive/comixed-dev) to search the archives.

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

## Abandoned/Discontinued

The **comixed-importer** project, for the time being, has been disabled as a part of our release bundles.

## Credits

* example.cbz - https://www.contrapositivediary.com/?p=1197
* missing_page.png - Original found at https://commons.wikimedia.org/wiki/File:Comic_image_missing.svg
* JWT authentication code based on https://www.devglan.com/spring-security/angular-jwt-authentication
