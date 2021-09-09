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
import org.comixedproject.adaptors.handlers.ComicFileHandler;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicfiles.ComicFileDescriptor;
import org.comixedproject.service.comicbooks.ComicService;
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
public class ComicInsertProcessor implements ItemProcessor<ComicFileDescriptor, Comic> {
  @Autowired private ComicService comicService;
  @Autowired private ComicFileHandler comicFileHandler;

  @Override
  public Comic process(final ComicFileDescriptor descriptor) throws Exception {
    if (this.comicService.findByFilename(descriptor.getFilename()) != null) {
      log.trace("Comic already exists. Aborting...");
      return null;
    }
    log.trace("Creating comic");
    final Comic comic = new Comic(descriptor.getFilename());
    log.trace("Setting archive type");
    this.comicFileHandler.loadComicArchiveType(comic);
    log.trace("Returning comic");
    return comic;
  }
}
