# Batch Processing

This document describes how batch processing is used to manage the contents of
the ComiXed library.

## The Processes

| Priority | Name                         | Description                                                                         |
|----------|------------------------------|-------------------------------------------------------------------------------------|
| 1        | **loadComicBooksJob**     | Load the contents of the comic file                                                 |
| 2        | **purgeLibraryJob**          | Deletes the records (and potentially the files) for comics removed from the library |
| 3        | **scrapeMetadataJob**        | Performs batch scraping of comic                                                    |
| 4        | **editComicMetadataJob**     | Performs a mass update of metadata for comics                                       |
| 5        | **updateMetadataJob**        | Updates the metadata contained in or with comic files                               |
| 6        | **recreateComicFilesJob**    | Recreates selected comic files                                                      |
| 7        | **organizeLibraryJob**       | Organize the comic files                                                            |
| 8        | **markBlockedPagesJob**      | Marks blocked pages for deletion                                                    |
| 9        | **processUnhashedComicsJob** | Loads the hash for every page in comics                                             |
| 10       | **addPagesToImageCacheJob**  | Adds uncached pages to the page cache                                               |

### Priority

To keep batch processes from blocking each other, there is a priority
assigned to each process, as shown in the table.

When the process loads comics for a process, it will only load those
which do **NOT** require that any higher priority process be run first. 
