# ComiXed Metadata For ComicVine

This project provides a comic book metadata adaptor for the
[ComiXed Project](http://www.comixedproject.org) that uses
data provided by [ComicVine](http://comicvine.gamespot.com).


# Setup

## Adding The Adaptor To ComiXed

To use this metadata adaptor, simply download the latest JAR
file release and drop it into the ```lib``` directory of your
ComiXed installation.

**NOTE:** ComiXed releases come with a copy of this metadata
adaptor already installed. However, newer versions of this
adaptor may be released after then. ComiXed does not put out
a new release when this adaptor is updated.


## The API Key

Once you start your server, you'll need to then configure the
adaptor, giving it your **ComicVine API key**. To get your
key, you will need to go to the ComicVine website and
register for one [here](https://comicvine.gamespot.com/api/).

# Usage

## Scraping A Comic Book

Once setup, the ComicVine adaptor should be shown as an option
in the dropdown list of metadata adaptors. Simply select it
while scraping (or set it as the preferred adaptor in your
server's configuration) and then scrape comics.
