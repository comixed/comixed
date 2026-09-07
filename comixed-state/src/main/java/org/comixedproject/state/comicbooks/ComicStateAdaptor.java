/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

package org.comixedproject.state.comicbooks;

import static org.comixedproject.state.comicbooks.ComicStateMachineConfiguration.COMIC_STATE_MACHINE;

import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.StateMachine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/**
 * <code>ComicStateAdaptor</code> provides methods for initiating state transitions in {@link
 * ComicBook} objects, and for subscribing to state changes.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicStateAdaptor {
  @Autowired
  @Qualifier(COMIC_STATE_MACHINE)
  private StateMachine<ComicDetail, ComicState, ComicEvent> stateMachine =
      new StateMachine<>(ComicState.class, ComicEvent.class);

  private final List<ComicStateListener> listeners = new ArrayList<>();

  public void addListener(final ComicStateListener listener) {
    this.listeners.add(listener);
  }

  public void fireEvent(final ComicDetail comic, final ComicEvent event) {
    log.debug("Firing comic book event: {}:{}", comic.getState(), event);
    this.stateMachine.processEvent(comic, event);
    for (int index = 0; index < this.listeners.size(); index++) {
      final ComicStateListener listener = this.listeners.get(index);
      listener.onComicStateChanged(comic);
    }
  }
}
