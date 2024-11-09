/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project.
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

package org.comixedproject.service.comicbooks;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;

import java.util.Date;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicBookRemovalAction;
import org.comixedproject.messaging.comicbooks.PublishComicBookUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateChangeListener;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;
import org.springframework.stereotype.Component;

/**
 * <code>ComicStateChangeAdaptor</code> provides an implementation of {@link
 * ComicStateChangeListener} to response to state change vents.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicStateChangeAdaptor implements InitializingBean, ComicStateChangeListener {
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private PublishComicBookUpdateAction publishComicBookUpdateAction;
  @Autowired private PublishComicBookRemovalAction publishComicBookRemovalAction;

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to comic state changes");
    this.comicStateHandler.addListener(this);
  }

  @Override
  public void onComicStateChange(
      final State<ComicState, ComicEvent> state, final Message<ComicEvent> message) {
    final var comic = message.getHeaders().get(HEADER_COMIC, ComicBook.class);
    if (comic == null) return;
    log.debug("Processing comic state change: [{}] =>  {}", comic.getId(), state.getId());
    if (state.getId() == ComicState.REMOVED) {
      log.trace("Publishing comic removal");
      try {
        this.publishComicBookRemovalAction.publish(comic);
      } catch (PublishingException error) {
        log.error("Failed to publish comic removal", error);
      }
    } else {
      comic.getComicDetail().setComicState(state.getId());
      comic.setLastModifiedOn(new Date());
      final ComicBook updated = this.comicBookService.save(comic);
      log.trace("Publishing comic  update");
      try {
        this.publishComicBookUpdateAction.publish(updated);
      } catch (PublishingException error) {
        log.error("Failed to publish comic update", error);
      }
    }
  }
}
