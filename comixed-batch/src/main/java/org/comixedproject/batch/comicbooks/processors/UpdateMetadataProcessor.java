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
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>UpdateMetadataProcessor</code> updates the metadata in a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class UpdateMetadataProcessor implements ItemProcessor<ComicBook, ComicBook> {
  @Autowired private ComicBookAdaptor comicBookAdaptor;

  @Override
  public ComicBook process(final ComicBook comicBook) {
    try {
      log.debug("Updating comicBook metadata: id={}", comicBook.getId());
      this.comicBookAdaptor.save(comicBook, comicBook.getArchiveType(), false, "");
    } catch (AdaptorException error) {
      log.error("Failed to update metadata for comicBook", error);
    }
    return comicBook;
  }
}
