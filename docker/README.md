# Installing The Docker Image

Installation is simple:

```
 $ docker pull comixed/comixed:latest
```

This pulls the latest version. Or you can replace **latest** with a specific version if you wish.

# Initial Run
## Where To Place Your Comics

It's recommended that you select a subdirectory that's decided solely to your library. This directory will hold both
the comic files as well as the database files (assuming you use the embedded database). It will also be the location
where you will place new comics in order to import them into your library.

For this document, we will assume that directory is **/Users/reader/comics**.

Beneath this directory, we want to have the actual comic files organized under a directory named **library** and the
database files under a directory named **database**.

## Starting The Docker Image For The First Time

To create the Docker image using the above directories, we'll use the following command line:

``` 
  $ docker create --name comixed \
      -it -p 7171:7171/tcp \
      -v /Users/reader/comixed/library:/library \
      -v /Users/reader/comixed/imports:/imports \
      -v /Users/reader/comixed/config:/root/.comixed \
      comixed/comixed:latest
```

This command line:
1. creates a runnable container named "comixed" in Docker,
1. redirects port 7171 from the host to the container,
1. uses /Users/reader/comixed/library when it looks for comics, 
1. uses /Users/reader/comixed/imports when it looks for new comics to import, and
1. uses /Users/reader/comixed/database for storing the database.

## Database Setup

By default, ComiXed uses an embedded [H2](https://www.h2database.com/html/main.html) database.
However, this is not a supported database for long term
us. It's highly recommended to use an external database.

To use a different database, you need to setup an external
configuration file that can be edited to provide the container
with the **JDBC URL**, **username** and **password** to log
into that database.

Currently, ComiXed ships with support for the following databases:

| Database   | Notes                                        | More Information           |
|------------|----------------------------------------------|----------------------------|
| H2         | For evaluation purposes only.                | https://www.h2database.com |
| MySQL      | MySQL v8 is the tested version.              | https://www.mysql.com/     |
| PostgreSQl | PostgreSQL v16 is the latest tested version. | https://www.postgresql.org |

To do this, after creating your container, execute the following command:

``` docker cp containername:/app/comixed-release-2.2.1-1/config/appplication.properties-example /Users/reader/comixed/config```

**NOTE:** Replace **containername** with the name of your container, and
**/Users/reader/comixed/config** with the path you used when creating
your container.

Now rename the file to ```application.properties```, and you can then follow
[the configuration documentation](../CONFIGURATION.md) to
customize your container.



## Starting Your Container

To start the container running, use:

``` $ docker start comixed```

# Importing Comics With Docker

To import new comics using your Docker image, you need to create a directory below your library. In our example above 
we used **/Users/reader/comixed/imports** as the location for the **/imports** volume. So we need to copy our new comic
files into that directory.

Next, from the **Import Comics** page, you enter as the import directory **/imports** and click the search
button. This will return all of the comics you just copied into that directory, and allow you to import them into your
library.

After selecting the comics to be imported, clicking the import button begins the process.


# Logging

The container, by default, generates the log file (named **comixed.log**) in the root directory of the library
directory.
