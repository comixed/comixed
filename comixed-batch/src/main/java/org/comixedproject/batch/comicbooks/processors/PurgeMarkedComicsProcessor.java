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
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.library.LastReadService;
import org.comixedproject.service.lists.ReadingListService;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>PurgeMarkedComicsProcessor</code> deletes the comic that was marked for purging.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PurgeMarkedComicsProcessor implements ItemProcessor<ComicBook, ComicBook> {
  @Autowired private ComicBookService comicBookService;
  @Autowired private ReadingListService readingListService;
  @Autowired private LastReadService lastReadService;

  @Override
  public ComicBook process(final ComicBook comicBook) throws Exception {
    log.debug("Removing comic book from all reading lists: id={}", comicBook.getId());
    this.readingListService.deleteEntriesForComicBook(comicBook);
    log.debug("Purging comic book: id={}", comicBook.getId());
    this.comicBookService.deleteComicBook(comicBook);
    return comicBook;
  }
}
