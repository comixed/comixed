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

package org.comixedproject.state.comicbooks.guards;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.guard.Guard;

/**
 * <code>AbstractComicGuard</code> provides a foundation for creating new guards for the comic state
 * machine.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractComicGuard implements Guard<ComicState, ComicEvent> {
  protected Comic fetchComic(final StateContext<ComicState, ComicEvent> context) {
    log.trace("Fetching comic");
    return context.getMessageHeaders().get(HEADER_COMIC, Comic.class);
  }
}
