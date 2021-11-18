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
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>LoadFileContentsProcessor</code> loads metadata for a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class LoadFileContentsProcessor implements ItemProcessor<Comic, Comic> {
  @Autowired private ComicBookAdaptor comicBookAdaptor;

  @Override
  public Comic process(final Comic comic) throws Exception {
    log.debug("Loading comic file contents: id={}", comic.getId());
    this.comicBookAdaptor.load(comic);
    log.trace("Sorting comic pages");
    comic.getPages().sort((o1, o2) -> o1.getFilename().compareTo(o2.getFilename()));
    log.trace("Returning updated comic");
    return comic;
  }
}
