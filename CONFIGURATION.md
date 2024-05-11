# Configuring The ComiXed Server

## Importing Unprocessed Comic Books

By default, after comic books are imported, a process is started to import
those comic books. This process involves such things are getting the list
of pages in each issue, getting the dimensions for those pages, etc.

### Batch Thread Pool Size

By default, the batch thread pool size is unbounded. You can set an upper
limit to the number of threads the server will using by setting a value to
the following property in ```application.properties```:

    comixed.batch.thread-pool-size=10

This example would limit the server to 10 parallel processes at most to
run batch jobs.


### Changing The Frequence For Scanning For Unprocessed Comics

By default, ComiXed will check every 60 seconds for unprocessed comics. You
can override that schedule by changing the following property in the
```application.properties``` file:

    comixed.batch.process-comic-books.period=60000

This value is the number of milliseconds to wait before checking for
unprocessed comics.

## Image Caching

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


## Changing The Image Cache Location

By default, these cached files are stored in the directory
```$HOME/.comixed/image-cache```.

This can be overridden from the command line temporarily using the
command line option:

    -i $DIRECTORY

This can also be overridden permanently by changing the following
property in the ```application.properties``` file:

    comixed.images.cache.location=$DIRECTORY

In both cases, replace **$DIRECTORY** with the full path to where you
want to have the cached images store.


## Change The Frequency For Generating Cache Entries 

By default, ComiXed will scan the database at the top of the hour. 

You can override that schedule by changing the following property in the
```application.properties``` file:

    comixed.batch.add-cover-to-image-cache.schedule=0 0 * * * *

See [below](Scheduling-Processes) for details on the scheduling format.

**NOTE:** There is no matching command line argument to override this.


## Loading Page Hashes

Whe a comic is imported, the page hash is not initially loaded. Instead, a
batch process runs periodically to load this value. The time between checks
is controlled by the following configuration option:

    comixed.batch.load-page-hashes.period=60000

It defines the numbero milliseconds between checks.


## Scheduling Processes

The scheduling format used looks like the following:

    property.name=* * * * * *

To simply describe this, it represents, from left to right, the second,
minute, hour, day of the month, and day of the week to run the job. It is
beyond the scope of this document to give more information, but you can
read more about it
[here](https://spring.io/blog/2020/11/10/new-in-spring-5-3-improved-cron-expressions#usage).
