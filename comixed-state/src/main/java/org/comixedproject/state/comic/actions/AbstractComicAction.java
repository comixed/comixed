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

package org.comixedproject.state.comic.actions;

import static org.comixedproject.state.comic.ComicStateHandler.HEADER_COMIC;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicState;
import org.comixedproject.state.comic.ComicEvent;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.action.Action;

/**
 * <code>AbstractComicAction</code> defines a base type for creating new actions that are executed
 * during a comic state change.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractComicAction implements Action<ComicState, ComicEvent> {
  protected Comic fetchComic(final StateContext<ComicState, ComicEvent> context) {
    return context.getMessageHeaders().get(HEADER_COMIC, Comic.class);
  }
}
