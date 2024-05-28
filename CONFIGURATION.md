# Configuring The ComiXed Server

## List Of Properties

Below is a list of configurable properties that can be altered to suit the
needs of the server administrator.

| PROPERTY                                        | USAGE                                       | FORMAT    |
|-------------------------------------------------|---------------------------------------------|-----------|
| comixed.batch.thread-pool                       | The number of threads to use for batch jobs | count     |
| comixed.batch.import-comic-files.period         | Check for importable comics                 | delay     |
| comixed.batch.process-comic-books.period        | Check for unprocessed comics                | delay     |
| comixed.batch.load-page-hashes.period           | Check for unprocessed comic pages           | delay     | 
| comixed.batch.mark-blocked-pages.period         | Check for unmarked blocked pages            | delay     | 
| comixed.batch.add-cover-to-image-cache.schedule | Update the image cache                      | scheduled |
| comixed.images.cache.location                   | The location of the image cache             | path      |

### Count Values

This sort of value is simple: it's the number of items to be used. For
example, for the thread pool, it's the maximum number of threads to be
created.

### Delay Values

Delay values are the number of milliseconds between when the instances of the
controlled component is processed.

### Schedule Values

This value looks like the following in the properties file:

    property.name=* * * * * *

To simply describe this, it represents, from left to right, the second,
minute, hour, day of the month, and day of the week to run the job. It is
beyond the scope of this document to give more information, but you can
read more about it
[here](https://spring.io/blog/2020/11/10/new-in-spring-5-3-improved-cron-expressions#usage).

### Path Values

This is an absolute path or filename.


# Image Caching

## Overview

Loading pages out of comic file archives is a relatively slow and painful
process. Anything that reduces the need to open the comic file directly
will improve the overall responsiveness of the server.

To this end, ComiXed will automatically add the **cover** image only for
every comic in the library to the image cache. Other pages are only
cached if and when they were accessed as part of using the server.

The image cache location and frequency for when the server will generate
missing image cache entries are both configurable through the runtime
properties file.

**NOTE:** Caching images can take up a lot of room, so it is advisable
to put your image cache on a large enough drive if the default location
is too small.


## Changing The Image Cache Location Temporarily

By default, these cached files are stored in the directory specified in the
application.properties file. However, this can be overridden from the
command line temporarily using the option:

    -i $DIRECTORY
