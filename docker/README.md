# Installing The Docker Image

Installation is simple:

``` $ docker pull comixed/comixed:latest```

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

``` $ docker create --name comixed \
                    -it -p 7171:7171/tcp \
                    -v /Users/reader/comixed/library:/library \
                    -v /Users/reader/comixed/imports:/imports \
                    -v /Users/reader/comixed/database:/root/.comixed \
                    comixed/comixed:latest
```

This command line:
1. creates a runnable container named "comixed" in Docker,
1. redirects port 7171 from the host to the container,
1. uses /Users/reader/comixed/library when it looks for comics, 
1. uses /Users/reader/comixed/imports when it looks for new comics to import, and
1. uses /Users/reader/comixed/database for storing the database.

## Using A Different Database

By default, ComiXed uses an embedded [H2](https://www.h2database.com/html/main.html) database. But it can also be told
to work with other databases, such as MySQL, PostgreSQL and HyperSQL.

To use a different database, you need to provide the container the **JDBC URL**, **username** and **password** to log
into that database via the command line:

```
 $ docker create --name comixed [all other args the same as above] -e DBURL=$URL -e DBUSERNAME=$USERNAME -e DBPASSWORD=$PASSWORD comixed/comixed:latest
```

where **$URL** is the JDBC URL to connect to the database, and **$USERNAME** and **$PASSWORD** as the credentials used
to log into the database and access the schema to be used by the application.

**NOTE:** The schema must also be created beforehand.

Currently, ComiXed ships with support for the following databases:

| Database   | Notes                       | More Information                          |
|------------|-----------------------------|-------------------------------------------|
| H2         | The default database        | https://www.h2database.com/html/main.html |
| HyperSQL   | Alternate embedded database | http://hsqldb.org/                        |
| MySQL      | v5.5 is the tested version  | https://www.mysql.com/                    |

### Example: User MySQL

First, log into the MySQL instance as an administrator. For this example, we're going to assume that the MySQL server
is running on a computer named **mysqldb** and is visible to the container.

Next, create a new account that will be used by ComiXed, called **cx-user**, that will use a password of **cx-password**:

``` > CREATE USER 'cx-user'@'%' IDENTIFIED BY 'cx-password';```

Finally, you will need to grant all privileges on the schema we'll be using to this user account. For this example, we'll
call the schema **cxschema** to keep things simple. So you'll next enter the following command in MySQL:

```
 > GRANT ALL PRIVILEGES ON cxschema.* TO 'cx-user'@'%';
 > FLUSH PRIVILEGES;
 ```

The account **cx-user** can now create tables and perform migrations.

After the above, you would then create your Docker container using the following command line:

```
 $ docker create --name comixed  -e DBURL=jdbc:mysql://mysqldb:3306/cxschema -e DBUSERNAME=cx-user -e DBPASSWORD=cx-password comixed/comixed:latest
```

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
