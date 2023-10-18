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

package org.comixedproject.batch.comicbooks.readers;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>RemoveComicBooksWithoutDetailsReader</code> returns comics that do not have a {@link
 * ComicDetail} record but which are not already marked for deletion.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class RemoveComicBooksWithoutDetailsReader extends AbstractComicReader {
  @Autowired private ComicBookService comicBookService;

  @Override
  protected List<ComicBook> doLoadComics() {
    log.debug("Loading comic books without details");
    return this.comicBookService.getComicBooksWithoutDetails(this.getBatchChunkSize());
  }
}
