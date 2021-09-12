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

package org.comixedproject.state.comicbooks.actions;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.lists.ReadingListEvent;
import org.comixedproject.state.lists.ReadingListStateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.statemachine.StateContext;
import org.springframework.stereotype.Component;

/**
 * <code>MarkComicForRemovalAction</code> is executed when a comic is marked for removal from the
 * library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MarkComicForRemovalAction extends AbstractComicAction {
  @Autowired private ReadingListStateHandler readingListStateHandler;

  @Override
  public void execute(final StateContext<ComicState, ComicEvent> context) {
    log.trace("Fetching comic");
    final Comic comic = this.fetchComic(context);
    Map<String, Comic> headers = new HashMap<>();
    headers.put(HEADER_COMIC, comic);
    comic
        .getReadingLists()
        .forEach(
            readingList -> {
              log.trace("Removing from reading list: {}", readingList.getName());
              this.readingListStateHandler.fireEvent(
                  readingList, ReadingListEvent.comicRemoved, headers);
            });
    log.trace("Setting comic deleted date");
    comic.setDateDeleted(new Date());
  }
}
