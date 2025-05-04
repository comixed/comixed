# Installing The Docker Image

Installation is simple:

```
 $ docker pull comixed/comixed:latest
```

This pulls the latest version. Or you can replace **latest** with a specific version if you wish.

# Initial Run
## Required Subdirectories

It's recommended that you select a subdirectory that's decided solely to your comic library. This directory will hold
both the comic files as well as the location where you will place new comics in order to import them into your library.

For this document, we will assume that directory is **/Users/reader/comics**.

In this subdirectory you'll need to create the following subdirectories:

1. ```library``` - where your managed comic files will live,
1. ```config``` - where you will place your **application.properties** file (see below), and
1. ```imports``` - the directory where you'll place comics to be imported.


## Creating Your Configuration File

The heart of your configuration is the **application.properties** file. This is where you will define things like what
type of database is used and how to connect to it, batch processing details, etc. You can download a copy of the file
[here](../comixed-app/src/main/resources/application.properties).

In this file, change:

```properties
comixed.images.cache.location=${user.home}/.comixed/image-cache
```

to:

```properties
comixed.images.cache.location=/config/image-cache
```

Also, configure the **external** database to be used. See [this file](../QUICKSTART.md) for details on how to setup
a database.

## Starting The Docker Image For The First Time

To create the Docker image using the above directories, we'll use the following command lines. First we need to pull 
the latest version:

```
  $ docker pull comixed/comixed:latest
```

Then create the container:

```
  $ docker build --name comixed \
      -it -p 7171:7171/tcp \
      -v /Users/reader/comixed/library:/library \
      -v /Users/reader/comixed/imports:/imports \
      -v /Users/reader/comixed/config:/config \
      comixed/comixed:latest
```

**NOTE:** On Linux, if using SELinux, you'll need to use the slightly different command below:

``` 
  $ docker build --name comixed \
      -it -p 7171:7171/tcp \
      -v /Users/reader/comixed/library:/library:z \
      -v /Users/reader/comixed/imports:/imports:z \
      -v /Users/reader/comixed/config:/config:z \
      comixed/comixed:latest
```


This command line:
1. creates a runnable container named "comixed" in Docker,
1. redirects port 7171 from the host to the container,
1. uses /Users/reader/comixed/library on the host as the library directory, 
1. uses /Users/reader/comixed/imports as the directory for importing comics, and
1. uses /Users/reader/comixed/database for the configuration files, plugins, and extensions.

Change the library, imports, and config paths to what is appropriate for your environment.


### Notes Regarding LinuxServer.io

The project maintains a [Docker compose](docker-compose.yml) files to make it easy to use ComiXed.

To give administrators greater control over files created and controlled by ComiXed, please visit
[this page](https://docs.linuxserver.io/general/understanding-puid-and-pgid/) for more details.

## Database Setup

By default, ComiXed uses an embedded [H2](https://www.h2database.com/html/main.html) database.
However, this is not a supported database for long term us. It's highly recommended to use an external database.

To use a different database, you need to setup an external configuration file that can be edited to provide the container
with the **JDBC URL**, **username** and **password** to log into that database. There are example blocks for the
currently supported set of databases.

Currently, ComiXed ships with support for the following databases:

| Database   | Notes                                        | More Information           |
|------------|----------------------------------------------|----------------------------|
| H2         | For evaluation purposes only.                | https://www.h2database.com |
| MySQL      | MySQL v8 is the tested version.              | https://www.mysql.com/     |
| PostgreSQl | PostgreSQL v16 is the latest tested version. | https://www.postgresql.org |

To do this, after creating your container, execute the following command:

``` docker cp containername:/app/comixed-release/config/appplication.properties-example /Users/reader/comixed/config```

**NOTE:** Replace **containername** with the name of your container, and
**/Users/reader/comixed/config** with the path you used when creating
your container.

Now rename the file to ```application.properties```, and you can then follow
[the configuration documentation](../CONFIGURATION.md) to
customize your container.

**NOTE:** Setting up the database is beyond the scope of this page. However, you'll need to ensure that, whatever type
of dataase you choose, the server needs to allow access from the container's IP network.


## Starting Your Container

To start the container running, use:

``` $ docker start comixed```

# Importing Comics With Docker

To import new comics using your Docker image, place the files into the directory used for the container's
**/config** directory.

Next, from the **Import Comics** page, you enter as the import directory **/imports** and click the search
button. This will return all of the comics you just copied into that directory, and allow you to import them into your
library.

After selecting the comics to be imported, clicking the import button begins the process.


# Logging

The container, by default, generates the log file (named **comixed.log**) in the root directory of the library
directory.
