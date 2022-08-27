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

package org.comixedproject.batch.comicbooks.writers;

import java.util.List;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>AbstractComicBookWriter</code> provides a foundation for creating {@link ItemWriter} types
 * that use the comic state machine.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
@RequiredArgsConstructor
public abstract class AbstractComicBookWriter implements ItemWriter<ComicBook> {
  @Autowired private ComicStateHandler comicStateHandler;

  @NonNull private ComicEvent comicEvent;

  @Override
  public void write(final List<? extends ComicBook> comics) {
    comics.forEach(
        comic -> {
          log.trace("Firing event: {}", this.comicEvent);
          this.comicStateHandler.fireEvent(comic, this.comicEvent);
        });
  }
}
