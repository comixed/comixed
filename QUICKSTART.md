# Quick Start Guide

## Overview

This document is to help you go from 0 to running the ComixEd application on your system.

## Installation

To install the application, simply place the comixed-app-*.jar file in the directory from which you would like to run it. The JAR file contains all of its dependencies, so you won't need to download any other files to run it.

## Configuring The Application

The JAR file contains the default **application.properties** file, which controls the runtime of the application.

By default, the applcation creates the runtime database, which contains your comic library, in:

* c:/users/[your name]/.comixed [on Windows]
* /home/[your name]/.comixed [on Linux, *nix]
* /Users/[your name]/.comixed [on Mac OS X]

## Launching The Application

To run the application use the following command line:

```
 $ java -jar [path to your JAR file]
```

This will launch the application in the current window as a text-only application. You'll see output as the application starts, creates your library database (when run the first time). When you see the following text, the application is ready for the next step:

```
2018-07-24 08:38:44.509  INFO 75198 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2018-07-24 08:38:44.520  INFO 75198 --- [           main] o.s.c.support.DefaultLifecycleProcessor  : Starting beans in phase 0
2018-07-24 08:38:44.640  INFO 75198 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 7171 (http)
2018-07-24 08:38:44.644  INFO 75198 --- [           main] org.comixed.ComixEdApp                   : Started ComixEdApp in 8.979 seconds (JVM running for 9.62)
```

## Logging In And Configuring Your Account

![account administration](images/account_change.png)

When run for the first time, ComixEd creates two default accounts for logging into the system:

1. Username: comixedadmin@localhost Password: comixedadmin
1. Username: comixedreader@localhost Password: comixedreader

It is **highly** recommended that you change at least the passwords for these accounts.

To log into the system as the user **comixedadmin@localhost**, open your web browser and go to **http://localhost:7171** and log in.

Once logged in, click on the **Account** link at the top of the page. This will take you to the account page. You can then change your password, and your login name.

Once you've done this, you'll need to log back into the application using that new name and password.

## Importing Your Comic Library

To import your existing comic library, click on **Comics** -> **Import comics** to go to the import page.

Here you enter the root directory for where your comic library is stored. For example, **c:/users/mcpi/Comics** or **/Users/mcpierce/Comics** and then click the **Load** button. This will scan the directory you entered and all child directories looking for all comic files not already in the library (you can run this multiple times to import new comics). When it finishes you'll see something like the following screen shot:

![importing comics](images/import_comics.png)

This will display *only* comics not already included in your library. You can now select individual comics, or else click the **Select All** button to import all new comics.

Clicking on the **Import** button will begin the process of importing the selected comics into the library. You can then click on the **Comics** -> **Library** link in the navigation bar to see your comics as they're imported into your library.

![comic library view](images/comic_library.png)

### ComicInfo.xml Support

When importing comics, all files that contain the comicinfo.xml file will have the information contained in it imported into your database. This way you won't have to rescrape sources like the ComicVine database for those comics.
