# ComiXed Importer

## Overview

The ComiXed Importer application allows for importing the contents of an
external comic database into your database.

## Before Starting

**BACK**. **UP**. **YOUR**. **DATABASE**.

## ImportState A ComicRack Database

To import the contents of a [ComicRack](http://comicrack.cyolito.com/)
database, you will want to do the following:

### Export Your Comics To CBZ Format

While not absolutely necessary, it's advisable to export your existing comics
to CBZ format. This allows for writing the comic metadata to the comic files
directly.

If you don't want to do this, then you can skip to the section **Export The
Database**.

Otherwise, 

### Enable Updating Your Comic Files

Go to **Edit > Preferences > Advanced** and enable the **Allow writing of
Book info into files**.

### Write Data To The Comic Files

In the library tree, look for **Files to update**. Select all of the comics
in that view. Right click on the comics and select **Update Book Files**.

### Export The Database

Go to **Edit > Preferences > Advanced** and click the button labeled **Backup
Database...*

This will generate a zip file named something like **ComicDB Backup [date].zip**.

Contained in this archive is a file named **ComicDB.xml**, which is the file
that contains data to be imported. Extract this file and save it to disk.

### Import The ComicRack Backup

To import the ComicRack backup into your database, you'll use the following
command line:

```
   $ comixed-importer --source=[path to ComicDB.xml]
```

#### Relocated Comic Files

If the comics are in a different location when you're importing them than they were on your ComicRack computer, you can pass in replacement rules to be used by the importer tool.

##### Example

Your ComicRack library is in **C:\Users\comiclover\Documents\comics** and you're moving your library to a Linux machine. You'll perform the following steps:

1. Copy the library files, keeping the subdirectory structure intact, onto the Linux machine.
   * For this example we'll assume you copied them into **/home/comiclover/Documents/comics**.
1. Do the steps described above to backup your ComicRack database.
1. Extract the **ComicDb.xml** file and place it into the home directory.

Now you can import the comics using the following command line:

```
$ comixed-importer --source=/home/comiclover/ComicDb.xml --replacements="C:\\Users\\comiclover\\Documents\\comics"="/home/comiclover/Documents/comics"
```

**NOTE:** The replacement source directory **MUST** exactly match what is in the ComicDb.xml file. Any differences, and the rule won't be applied. 
