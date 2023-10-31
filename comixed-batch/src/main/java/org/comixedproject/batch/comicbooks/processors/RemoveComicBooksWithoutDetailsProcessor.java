/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>RemoveComicBooksWithoutDetailsProcessor</code> checks a {@link ComicBook} for its {@link
 * ComicDetail} and, if not found, allows it to be marked for deletion.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class RemoveComicBooksWithoutDetailsProcessor
    implements ItemProcessor<ComicBook, ComicBook> {
  @Autowired private ComicBookService comicBookService;

  @Override
  @Transactional
  public ComicBook process(final ComicBook comicBook) {
    log.debug("Deleting comic book: id={}", comicBook.getId());
    this.comicBookService.deleteComicBook(comicBook);
    return null;
  }
}
