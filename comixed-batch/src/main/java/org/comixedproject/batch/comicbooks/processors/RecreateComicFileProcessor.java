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

import static org.comixedproject.service.admin.ConfigurationService.CFG_LIBRARY_PAGE_RENAMING_RULE;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.admin.ConfigurationService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>RecreateComicFileProcessor</code> recreates comic files.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class RecreateComicFileProcessor implements ItemProcessor<ComicBook, ComicBook> {
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private ConfigurationService configurationService;

  @Override
  public ComicBook process(final ComicBook comicBook) throws Exception {
    log.debug("Getting target archive adaptor: id={}", comicBook.getComicBookId());
    if (comicBook.getComicDetail().getFile().exists()
        && comicBook.getComicDetail().getFile().isFile()) {
      try {
        log.trace("Recreating comicBook files");
        this.comicBookAdaptor.save(
            comicBook,
            comicBook.getTargetArchiveType(),
            comicBook.isDeletePages(),
            this.configurationService.getOptionValue(CFG_LIBRARY_PAGE_RENAMING_RULE, ""));
      } catch (AdaptorException error) {
        log.error("Failed to recreate comic book file", error);
      }
    } else {
      log.error("Can't recreate file: {}", comicBook.getComicDetail().getFile().getAbsoluteFile());
    }
    return comicBook;
  }
}
