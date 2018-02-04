# Architecture

This document seeks to describe the big picture architecture of the ComixEd application.

## Working With Comic Files

The following is a list of the big components that make up the application.

### Archive Adaptor

[ArchiveAdaptor](src/main/java/org/comixed/library/adaptors/ArchiveAdaptor.java) defines a type that can read (and potentially write) a digital comic files.

There are classes which implement this interface to handle supported comic archive types, such as CBZ, CBR and CB7 files.

### File Loaders
 
[EntryLoader](src/main/java/org/comixed/library/loaders/EntryLoader.java) defines a type that can read and write files, either from disk or which are contained within an archive.
 
### The Comic File Handler

The [ComicFileHandler](src/main/java/org/comixed/library/model/ComicFileHandler.java) brings together the archive and file handlers to perform the actual loading of the comics in the library.

## Working With The Comic Library

The comic library is composed of two portions: the physical comics in storage, and a database that tracks additional information on those comics. 

### The Comic And Page Classes

When a comic is loaded from storage, it is represented by an instance of (Comic)[src/main/java/org/comixed/library/model/Comic.java). This class holds the details for the comic, such as the publisher, the cover date, title, writer, artist, etc.

It also has several instances of the [Page](src/main/java/org/comixed/library/model/Page.java) class, one for each page of the comic found in the archive.

### The Comic Repository

The records for each comic that are stored in the database are created and retrieved using the [ComicRepository](src/main/java/org/comixed/repositories/ComicRepository.java).

### Why Is There A Page Repository?

The [PageRepository](src/main/java/org/comixed/repositories/PageRepository.java) is used to track the hashes that uniquely identify each page in each comic in the library. This is used to look for duplicate pages across the whole of the library and is used when marking pages for deletion.

## The Worker

Since there are a lot of things that need to happen in parallel, there exists a [Worker](src/main/java/org/comixed/tasks/Worker.java) class to handle those tasks.

On startup, the application starts an instance of *Worker* in its own thread. Then, as tasks (such as updating a comic's database entry, importing a new comic into the library, converting a comic from one format to another) are discovered, they are queued up and *Worker* runs them sequentially. This keeps the program from stopping or blocking the user from doing other things while these tasks run in the background.

