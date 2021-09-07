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
import org.comixedproject.batch.BatchException;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.comicbooks.Comic;
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
public class UpdateMetadataProcessor implements ItemProcessor<Comic, Comic> {
  @Autowired private ComicFileHandler comicFileHandler;

  @Override
  public Comic process(final Comic comic) throws Exception {
    log.trace("Retrieving archive adaptor");
    final var archiveAdaptor = this.comicFileHandler.getArchiveAdaptorFor(comic.getArchiveType());
    if (archiveAdaptor == null)
      throw new BatchException(
          "No archive adaptor found for " + comic.getArchiveType().getMimeType());

    log.trace("Updating comic metadata");
    final Comic result = archiveAdaptor.updateComic(comic);
    log.trace("Returning updated comics");
    return result;
  }
}
