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

package org.comixedproject.state.lists.guards;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.state.lists.ReadingListEvent;
import org.springframework.statemachine.StateContext;
import org.springframework.stereotype.Component;

/**
 * <code>ComicIsNotInReadingListGuard</code> ensures that the comic is not already in the reading
 * list.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicIsNotInReadingListGuard extends AbstractReadingListGuard {
  /**
   * Returns whether the comic in question is already in the reading list.
   *
   * @param context the message context
   * @return true if the comic is not in the reading list
   */
  @Override
  public boolean evaluate(final StateContext<ReadingListState, ReadingListEvent> context) {
    log.trace("Fetching reading list");
    final ReadingList readingList = this.fetchReadingList(context);
    log.trace("Fetching comicBook");
    final ComicBook comicBook = this.fetchComic(context);
    return !readingList.getEntries().contains(comicBook.getComicDetail());
  }
}
