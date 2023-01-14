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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.comixedproject.model.metadata.FilenameMetadata;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.FilenameScrapingRuleService;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicInsertProcessor</code> converts a descriptor into a comic record. If there is already
 * an existing comic in the library for the provided file then that record is discarded.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicInsertProcessor implements ItemProcessor<ComicFileDescriptor, ComicBook> {
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private FilenameScrapingRuleService filenameScrapingRuleService;

  @Override
  public ComicBook process(final ComicFileDescriptor descriptor) {
    if (this.comicBookService.findByFilename(descriptor.getFilename()) != null) {
      log.debug("ComicBook already exists. Aborting: filename=", descriptor.getFilename());
      return null;
    }
    try {
      log.debug("Creating comicBook: filename={}", descriptor.getFilename());
      final ComicBook comicBook = this.comicBookAdaptor.createComic(descriptor.getFilename());
      log.trace("Scraping comicBook filename");
      final FilenameMetadata metadata =
          this.filenameScrapingRuleService.loadFilenameMetadata(comicBook.getBaseFilename());
      if (metadata.isFound()) {
        log.trace("Scraping rule applied");
        comicBook.getComicDetail().setSeries(metadata.getSeries());
        comicBook.getComicDetail().setVolume(metadata.getVolume());
        comicBook.getComicDetail().setIssueNumber(metadata.getIssueNumber());
        comicBook.getComicDetail().setCoverDate(metadata.getCoverDate());
      }
      log.trace("Returning comicBook");
      return comicBook;
    } catch (AdaptorException error) {
      log.error("Error inserting comic record", error);
      return null;
    }
  }
}
