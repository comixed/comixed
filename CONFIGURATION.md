# Configuring The ComiXed Server

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

To simply describe things, from left to right, the values are the second,
minute, hour, day of the month, and day of the week to run the job. It is
beyond the scope of this document to give more information, but you can
read more about it
[here](https://spring.io/blog/2020/11/10/new-in-spring-5-3-improved-cron-expressions#usage).

**NOTE:** There is no matching command line argument to override this.
