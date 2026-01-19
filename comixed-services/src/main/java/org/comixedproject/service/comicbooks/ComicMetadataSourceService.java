/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

package org.comixedproject.service.comicbooks;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.repositories.comicbooks.ComicMetadataSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>ComicMetadataSourceService</code> provides methods for working with instances of {@link
 * ComicMetadataSource}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicMetadataSourceService {
  @Autowired private ComicMetadataSourceRepository comicMetadataSourceRepository;

  public ComicMetadataSource getMetadataForComicBook(final long id) {
    log.debug("Loading comic metadata source for comic book: id={}", id);
    return this.comicMetadataSourceRepository.findByComicBookId(id);
  }
}
