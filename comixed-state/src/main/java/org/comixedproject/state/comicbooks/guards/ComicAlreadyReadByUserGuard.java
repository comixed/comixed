package org.comixedproject.state.comicbooks.guards;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.springframework.statemachine.StateContext;
import org.springframework.stereotype.Component;

/**
 * <code>ComicAlreadyReadByUserGuard</code> ensures a comic is marked as read by the specified user.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicAlreadyReadByUserGuard extends AbstractComicGuard {
  @Override
  public boolean evaluate(final StateContext<ComicState, ComicEvent> context) {
    log.trace("Fetching comicBook");
    final ComicBook comicBook = this.fetchComic(context);
    log.trace("Fetching user");
    final ComiXedUser user = this.fetchUser(context);
    return comicBook.getLastReads().stream().anyMatch(lastRead -> lastRead.getUser().equals(user));
  }
}
