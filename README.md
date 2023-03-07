# ComiXed
An application for managing digital comics.

## Status
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=comixed)](https://sonarcloud.io/dashboard?id=comixed)\
[![Latest Release](https://github.com/comixed/comixed/actions/workflows/publish-release.yml/badge.svg)](https://actions-badge.atrox.dev/comixed/comixed/goto?ref=master)\
[![Docker Release](https://github.com/comixed/comixed/actions/workflows/publish-to-docker-hub.yml/badge.svg)](https://actions-badge.atrox.dev/comixed/comixed/goto?ref=master)

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
   * blocking pages based on hash identifiers so that they are ignored,
   * sharing of blocked page files,
   * deleting blocked pages from comics,
   * consolidating the library, including performing any or all of the following steps:
      * moving all files into a well-defined directory structure,
      * converting comics to a single archive type,
      * removing files from each comic that have been blocked, and
      * updating the ComicInfo.xml file within each comic with the current metadata.
 * allow administrators to quickly import new comics into their library,
 * enable scraping metadata for comics from various sources, such as [ComicVine](https://comicvine.gamespot.com/).
 * allow managed access to the contents of the library:
    * administrative users can create/delete other users,
    * users can create reading lists,
    * users can manage their read state for all comics in the library, and
    * users can read comics using an OPDS application.
 * provide a plugin system that allows administrators to customize the features in their application:
    * plugins can be written by third-parties to provide new and custom functionality, and
    * administrators can easily install plugins.
 * allow users to share:
    * blocked page lists.
    * reading lists.

## What The Project Will Not Do
 * It is not a comic reading application.
    * For that, we recommend applications like [Chunky](http://chunkyreader.com/) (iOS), [YACReader](https://www.yacreader.com/) (iOS), [Librera](https://play.google.com/store/apps/details?id=com.foobnix.pdf.reader) (Android)

## Supported Comic Formats

The following digital comic formats are supported:

 * CBZ (ZIP)
 * CBR (RAR)
 * CB7 (7ZIP)

## Building The Application

For details on building things locally, please see the [CONTRIBUTING.md](CONTRIBUTING.md) files.

## Participating

### Reddit

We are now on Reddit! You can discuss the project, and related topics, in the [ComiXed](https://www.reddit.com/r/comixed/) subreddit! While our [old group](https://www.reddit.com/r/comixedmanager) is still available, please move all conversations to the new group.

### Mailing Lists

There are two mailing lists available for getting involved in the community.

#### ComiXed Users

For users of the project. please sign up for our [user list](https://www.freelists.org/list/comixed). It's where
general questions, comments and discussions around the application take place.

You can also go [here](https://www.freelists.org/archive/comixed) to search the archives.

#### ComiXed Developers

For contributors to the project, please sign up for our [developer list](https://www.freelists.org/list/comixed-dev).
It's where feature, coding and bug fix discussions take place.

You can also go [here](https://www.freelists.org/archive/comixed-dev) to search the archives.

## Contributing

Please read the [this](./CONTRIBUTING.md) for guidelines on contributing to the project.

## Credits

* example.cbz - https://www.contrapositivediary.com/?p=1197
* missing_page.png - Original found at https://commons.wikimedia.org/wiki/File:Comic_image_missing.svg
* JWT authentication code based on https://www.devglan.com/spring-security/angular-jwt-authentication
* credit.png, character.png, team.png, location.png, story.png - https://www.kindpng.com/
