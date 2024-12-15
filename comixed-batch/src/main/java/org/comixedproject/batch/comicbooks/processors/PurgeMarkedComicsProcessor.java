/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.processors;

import static org.comixedproject.service.admin.ConfigurationService.CFG_DELETE_PURGED_COMIC_FILES;

import java.io.File;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.lists.ReadingListService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>PurgeMarkedComicsProcessor</code> deletes the comic that was marked for purging.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class PurgeMarkedComicsProcessor implements ItemProcessor<ComicBook, ComicBook> {
  @Autowired private ComicBookService comicBookService;
  @Autowired private ReadingListService readingListService;
  @Autowired private ConfigurationService configurationService;
  @Autowired private FileAdaptor fileAdaptor;

  @Override
  public ComicBook process(final ComicBook comicBook) throws Exception {
    try {
      log.debug("Removing comic book from all reading lists: id={}", comicBook.getId());
      this.readingListService.deleteEntriesForComicBook(comicBook);
      log.debug("Purging comic book: id={}", comicBook.getId());
      final File file = comicBook.getComicDetail().getFile();
      this.comicBookService.deleteComicBook(comicBook);
      if (this.configurationService.isFeatureEnabled(CFG_DELETE_PURGED_COMIC_FILES)) {
        log.debug("Deleting comic file:{}", file);
        this.fileAdaptor.deleteFile(file);
      }
    } catch (Exception error) {
      log.error("Failed to purge comic book", error);
    }
    return comicBook;
  }
}
