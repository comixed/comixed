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

package org.comixedproject.state.lists.actions;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.comixedproject.state.lists.ReadingListEvent;
import org.springframework.statemachine.StateContext;
import org.springframework.stereotype.Component;

/**
 * <code>RemoveComicFromReadingListAction</code> removes a comic from a reading list.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class RemoveComicFromReadingListAction extends AbstractReadingListAction {
  @Override
  public void execute(final StateContext<ReadingListState, ReadingListEvent> context) {
    log.trace("Fetching reading list");
    final ReadingList readingList = this.fetchReadingList(context);
    log.trace("Fetching comicBook");
    final ComicBook comicBook = this.fetchComic(context);
    log.trace("Removing comicBook from reading list");
    readingList.getComicBooks().remove(comicBook);
  }
}
