/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.library;

import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class LibraryService {
  @Autowired private ComicBookService comicBookService;
  @Autowired private FileAdaptor fileAdaptor;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private ComicStateHandler comicStateHandler;

  /**
   * Removes all files in the image cache directory.
   *
   * @throws LibraryException if an error occurs
   */
  public void clearImageCache() throws LibraryException {
    String directory = this.pageCacheService.getRootDirectory();
    log.debug("Clearing the image cache: {}", directory);
    try {
      this.fileAdaptor.deleteDirectoryContents(directory);
    } catch (IOException error) {
      throw new LibraryException("failed to clean image cache directory", error);
    }
  }

  /**
   * Fires an event to start the metadata update process for the specified comics.
   *
   * @param ids the comics
   */
  public void updateMetadata(final List<Long> ids) {
    ids.forEach(
        id -> {
          try {
            final ComicBook comicBook = this.comicBookService.getComic(id);
            log.trace("Firing action to update metadata: id={}", id);
            this.comicStateHandler.fireEvent(comicBook, ComicEvent.updateMetadata);
          } catch (ComicBookException error) {
            log.error("Failed to update comic", error);
          }
        });
  }

  /**
   * Updates all comics in preparation for library consolidation.
   *
   * @param targetDirectory the target directory
   * @throws LibraryException if an error occurs
   */
  public void prepareForConsolidation(final List<Long> ids, final String targetDirectory)
      throws LibraryException {
    if (StringUtils.isEmpty(targetDirectory)) {
      throw new LibraryException("Target directory is not configured");
    }
    log.trace("Marking comics to be consolidated");
    this.comicBookService.prepareForConsolidation(ids);
  }

  @Transactional
  public void prepareToRecreateComicBook(final long id) throws LibraryException {
    try {
      log.debug("Setting recreating flag on comic book: id={}", id);
      final ComicBook comicBook = this.comicBookService.getComic(id);
      comicBook.setRecreating(true);
      this.comicBookService.save(comicBook);
    } catch (ComicBookException error) {
      throw new LibraryException("Failed to prepare comic book for recreation", error);
    }
  }

  /**
   * Prepares comics to have their files recreated.
   *
   * @param ids the comic ids
   */
  public void prepareToRecreateComicBooks(final List<Long> ids) {
    log.debug("Preparing to recreate comic book files");
    this.comicBookService.prepareForRecreation(ids);
  }

  /** Begins the process of purging comics from the library. */
  public void prepareForPurging() {
    final int count = (int) this.comicBookService.getComicBookCount();
    if (count > 0) {
      this.comicBookService
          .findComicsMarkedForDeletion(count)
          .forEach(
              comicBook -> {
                log.trace("Firing action: purge comicBook id={}", comicBook.getId());
                this.comicStateHandler.fireEvent(comicBook, ComicEvent.prepareToPurge);
              });
    } else {
      log.info("No comic books found to purge");
    }
  }
}
