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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.springframework.statemachine.StateContext;
import org.springframework.stereotype.Component;

/**
 * <code>ComicNotAlreadyReadByUserGuard</code> ensures that a comic was not already marked as read
 * by a user.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicNotAlreadyReadByUserGuard extends AbstractComicGuard {
  @Override
  public boolean evaluate(final StateContext<ComicState, ComicEvent> context) {
    log.trace("Fetching comicBook");
    final ComicBook comicBook = this.fetchComic(context);
    log.trace("Fetching user");
    final ComiXedUser user = this.fetchUser(context);
    return comicBook.getLastReads().stream().noneMatch(lastRead -> lastRead.getUser().equals(user));
  }
}
