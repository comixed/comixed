# Running ComiXed In A Docker Container

## Installing The Docker Image

Installation is simple:

``` $ docker pull comixed/comixed:latest```

This pulls the latest version. Or you can replace **latest** with a specific version if you wish.

## Initial Run
### Where To Place Your Comics

It's recommended that you select a subdirectory that's decided solely to your library. This directory will hold both
the comic files as well as the database files (assuming you use the embedded database). It will also be the location
where you will place new comics in order to import them into your library.

For this document, we will assume that directory is **/Users/reader/comics**.

Beneath this directory, we want to have the actual comic files organized under a directory named **library** and the
database files under a directory named **database**.

### Starting The Docker Image For The First Time

To create the Docker image using the above directories, we'll use the following command line:

``` $ docker create --name comixed -it -p 7171:7171/tcp -v /Users/reader/comixed/library:/comic_dir -v /Users/reader/comixed/database:/root/.comixed comixed/comixed:latest```

This command line:
1. creates a runnable container named "comixed" in Docker,
2. redirects port 7171 from the host to the container,
3. uses /Users/reader/comixed/library when it looks for comics, and
4. uses /Users/reader/comixed/database for storing the database.

Then to start it running, use:

``` $ docker start comixed```

## Importing Comics With Docker

To import new comics using your Docker image, you need to create a directory below your library. Since, in our example
above, we put our comics in /Users/reader/comixed/library, we'll create a new directory below that called
**/Users/reader/comixed/library/importing**.

We then copy the new comics into this directory.

Then, from the **Image Comics** page, you enter as the import directory **/comic_dir/importing** and click the search
button. This will return all of the comics you just copied into that directory, and allow you to import them into your
library.
