/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.state.comicbooks.actions;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.springframework.statemachine.StateContext;
import org.springframework.stereotype.Component;

/**
 * <code>MarkComicAsFoundActionTest</code> marks a comic as found.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MarkComicAsFoundAction extends AbstractComicAction {
  @Override
  public void execute(final StateContext<ComicState, ComicEvent> context) {
    final ComicBook comicBook = this.fetchComic(context);
    log.debug("Marking comic book as found: id={}", comicBook.getComicBookId());
    comicBook.getComicDetail().setMissing(false);
  }
}
