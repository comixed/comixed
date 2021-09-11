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

import java.io.File;
import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicbooks.ComicService;
import org.comixedproject.service.comicbooks.PageCacheService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class LibraryService {
  @Autowired private ComicService comicService;
  @Autowired private GenericUtilitiesAdaptor genericUtilitiesAdaptor;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private ComicStateHandler comicStateHandler;

  @Transactional
  public List<Comic> consolidateLibrary(boolean deletePhysicalFiles) {
    log.debug("Consolidating library: delete physical files={}", deletePhysicalFiles);

    List<Comic> result = this.comicService.findAllMarkedForDeletion();

    for (Comic comic : result) {
      log.debug("Removing deleted comics from library");
      this.comicService.delete(comic);

      if (deletePhysicalFiles) {
        String filename = comic.getFilename();
        File file = comic.getFile();
        log.debug("Deleting physical file: {}", filename);
        this.genericUtilitiesAdaptor.deleteFile(file);
      }
    }
    return result;
  }

  /**
   * Removes all files in the image cache directory.
   *
   * @throws LibraryException if an error occurs
   */
  public void clearImageCache() throws LibraryException {
    String directory = this.pageCacheService.getRootDirectory();
    log.debug("Clearing the image cache: {}", directory);
    try {
      this.genericUtilitiesAdaptor.deleteDirectoryContents(directory);
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
}
