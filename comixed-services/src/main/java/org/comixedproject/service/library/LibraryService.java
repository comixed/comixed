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

import static org.comixedproject.state.comicbooks.ComicStateHandler.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.StringUtils;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Log4j2
public class LibraryService {
  @Autowired private ComicService comicService;
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
            final Comic comic = this.comicService.getComic(id);
            log.trace("Firing action to update metadata: id={}", id);
            this.comicStateHandler.fireEvent(comic, ComicEvent.updateMetadata);
          } catch (ComicException error) {
            log.error("Failed to update comic", error);
          }
        });
  }

  /**
   * Updates all comics in preparation for library consolidation.
   *
   * @param targetDirectory the target directory
   * @param renamingRule the renaming rule
   * @param deleteRemovedComicFiles the delete removed comic files flag
   * @throws LibraryException if an error occurs
   */
  public void prepareForConsolidation(
      final String targetDirectory,
      final String renamingRule,
      final boolean deleteRemovedComicFiles)
      throws LibraryException {
    if (StringUtils.isEmpty(targetDirectory)) {
      throw new LibraryException("Target directory is not configured");
    }
    log.trace("Preparing message headers");
    Map<String, Object> headers = new HashMap<>();
    headers.put(HEADER_DELETE_REMOVED_COMIC_FILE, String.valueOf(deleteRemovedComicFiles));
    headers.put(HEADER_TARGET_DIRECTORY, targetDirectory);
    headers.put(HEADER_RENAMING_RULE, renamingRule);
    this.comicService
        .findAll()
        .forEach(
            comic -> {
              log.trace(
                  "Preparing comics for consolidation: [{}] {}",
                  comic.getId(),
                  comic.getFilename());
              this.comicStateHandler.fireEvent(comic, ComicEvent.consolidateComic, headers);
            });
  }

  /**
   * Prepares comics to have their files recreated.
   *
   * @param ids the comic ids
   */
  public void prepareToRecreateComics(final List<Long> ids) {
    ids.forEach(
        id -> {
          try {
            final Comic comic = this.comicService.getComic(id);
            log.trace("Firing action to recreate comic: id={}", id);
            this.comicStateHandler.fireEvent(comic, ComicEvent.recreateComicFile);
          } catch (ComicException error) {
            log.error("Failed to update comic", error);
          }
        });
  }

  /**
   * Begins the process of purging comics from the library.
   *
   * @param ids the ids of comics to be purged
   */
  public void prepareForPurging(final List<Long> ids) {
    ids.forEach(
        id -> {
          try {
            final Comic comic = this.comicService.getComic(id);
            log.trace("Firing action: purge comic id={}", id);
            this.comicStateHandler.fireEvent(comic, ComicEvent.prepareToPurge);
          } catch (ComicException error) {
            log.error("Failed to prepare comic for purge", error);
          }
        });
  }
}
