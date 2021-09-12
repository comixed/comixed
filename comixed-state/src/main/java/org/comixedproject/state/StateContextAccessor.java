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

package org.comixedproject.state;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;
import static org.comixedproject.state.lists.ReadingListStateHandler.HEADER_READING_LIST;

import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.lists.ReadingList;
import org.springframework.statemachine.StateContext;

/**
 * <code>StateContextAccessor</code> provides a simple parent that retrieves objects from a state
 * context.
 *
 * @author Darryl L Pierce
 */
public class StateContextAccessor {
  /**
   * Retrieves a comic from the state context.
   *
   * @param context the context
   * @return the comic
   */
  protected Comic fetchComic(final StateContext<?, ?> context) {
    return context.getMessageHeaders().get(HEADER_COMIC, Comic.class);
  }

  /**
   * Retrieves a reading list from the state context.
   *
   * @param context the context
   * @return the reading list
   */
  protected ReadingList fetchReadingList(final StateContext<?, ?> context) {
    return context.getMessageHeaders().get(HEADER_READING_LIST, ReadingList.class);
  }
}
